import { useState, useMemo } from 'react';

export default function App(){
  const [tab,setTab]=useState('inicio');
  const [lancs,setLancs]=useState<any[]>([]); // ZERADO
  const [prods,setProds]=useState<any[]>([]); // ZERADO
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState<any>({tipo:'despesa',descricao:'',valor:'',data:new Date().toISOString().slice(0,10),vencimento:new Date().toISOString().slice(0,10),forma:'PIX',banco:'Caixa Loja',fornecedor:'',status:'pendente'});
  const [showProd,setShowProd]=useState(false);
  const [pform,setPform]=useState<any>({nome:'',custo:'',venda:'',estoque:'',minimo:'5',validade:new Date().toISOString().slice(0,10),unidade:'kg'});

  const saldo = useMemo(()=> lancs.filter(l=>l.status==='pago').reduce((a,l)=> a + (l.tipo==='receita'?l.valor:-l.valor),0),[lancs]);
  const aPagar = useMemo(()=> lancs.filter(l=>l.tipo==='despesa'&&l.status!=='pago').reduce((a,l)=>a+l.valor,0),[lancs]);
  const aReceber = useMemo(()=> lancs.filter(l=>l.tipo==='receita'&&l.status!=='pago').reduce((a,l)=>a+l.valor,0),[lancs]);

  const apagarLanc = (id:string) => { if(confirm('Apagar este lancamento?')) setLancs(lancs.filter(l=>l.id!==id)); }
  const apagarProd = (id:string) => { if(confirm('Apagar este produto?')) setProds(prods.filter(p=>p.id!==id)); }

  const exportarLanc = () => {
    if(lancs.length===0) return alert('Nenhum lancamento para exportar');
    const header = 'Data,Vencimento,Tipo,Descricao,Valor,Forma,Banco,Fornecedor,Status\n';
    const rows = lancs.map(l=>`${l.data},${l.vencimento},${l.tipo},${l.descricao},${l.valor},${l.forma},${l.banco},${l.fornecedor},${l.status}`).join('\n');
    const blob = new Blob([header+rows],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='nosso-frio-lancamentos.csv'; a.click();
  }
  const exportarProd = () => {
    if(prods.length===0) return alert('Nenhum produto para exportar');
    const header = 'Nome,SKU,Custo,Venda,Estoque,Minimo,Validade,Unidade\n';
    const rows = prods.map(p=>`${p.nome},${p.sku},${p.custo},${p.venda},${p.estoque},${p.minimo},${p.validade},${p.unidade}`).join('\n');
    const blob = new Blob([header+rows],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='nosso-frio-estoque.csv'; a.click();
  }

  // Dados para grafico simples - ultimos 7 dias
  const grafico = useMemo(()=>{
    const dias = [...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
    return dias.map(d=>{ const total = lancs.filter(l=>l.data===d).reduce((a,l)=>a+(l.tipo==='receita'?l.valor:-l.valor),0); return {data:d.slice(5,10),valor:total}; });
  },[lancs]);

  const maxGraf = Math.max(10, ...grafico.map(g=>Math.abs(g.valor)));

  return (
    <div style={{minHeight:'100vh',background:'#f6f7f4',fontFamily:'Inter,sans-serif',color:'#0f172a'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&display=swap');*{font-family:Inter,sans-serif;box-sizing:border-box}.card{background:white;border-radius:20px;padding:20px;border:1px solid #eef0eb;box-shadow:0 4px 16px rgba(0,0,0,.05)}.btn{background:#0f172a;color:white;border-radius:999px;padding:12px 20px;font-weight:800;border:none;cursor:pointer}.btn2{background:#f1f5f9;border-radius:999px;padding:10px 16px;font-weight:600;border:1px solid #e2e8f0;cursor:pointer} input,select{width:100%;padding:12px;border-radius:12px;border:1px solid #ddd}`}</style>

      <div style={{background:'#0f172a',color:'white',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}><div style={{background:'#34d399',color:'#0f172a',width:38,height:38,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>NF</div><div><div style={{fontWeight:800}}>Nosso Frio</div><div style={{fontSize:11,opacity:.6}}>Financeiro da Empresa - Zerado</div></div></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={()=>setTab('inicio')} style={{padding:'8px 14px',borderRadius:999,border:'none',cursor:'pointer',background:tab==='inicio'?'white':'rgba(255,255,255,0.15)',color:tab==='inicio'?'#0f172a':'white',fontWeight:600}}>Inicio</button>
          <button onClick={()=>setTab('lancar')} style={{padding:'8px 14px',borderRadius:999,border:'none',cursor:'pointer',background:tab==='lancar'?'white':'rgba(255,255,255,0.15)',color:tab==='lancar'?'#0f172a':'white',fontWeight:600}}>Lancamentos</button>
          <button onClick={()=>setTab('estoque')} style={{padding:'8px 14px',borderRadius:999,border:'none',cursor:'pointer',background:tab==='estoque'?'white':'rgba(255,255,255,0.15)',color:tab==='estoque'?'#0f172a':'white',fontWeight:600}}>Estoque</button>
        </div>
        <div style={{textAlign:'right'}}><div style={{fontSize:11,opacity:.6}}>Saldo Total</div><div style={{fontWeight:800}}>R$ {saldo.toLocaleString('pt-BR')}</div></div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:24,paddingBottom:80}}>
        {tab==='inicio' && <div style={{display:'grid',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
            <div className="card"><div style={{fontSize:12,opacity:.6}}>Saldo em Conta</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>R$ {saldo.toLocaleString('pt-BR')}</div><div style={{fontSize:11,marginTop:8,opacity:.5}}>● Dados seguros</div></div>
            <div className="card"><div style={{fontSize:12,opacity:.6}}>A Receber</div><div style={{fontSize:28,fontWeight:800,marginTop:6}}>R$ {aReceber.toLocaleString('pt-BR')}</div></div>
            <div className="card" style={{background:'#fffbeb'}}><div style={{fontSize:12,opacity:.7}}>A Pagar</div><div style={{fontSize:28,fontWeight:800,marginTop:6,color:'#b45309'}}>R$ {aPagar.toLocaleString('pt-BR')}</div></div>
            <div className="card"><div style={{fontSize:12,opacity:.6}}>Lucro Mes</div><div style={{fontSize:28,fontWeight:800,marginTop:6,color:'#059669'}}>R$ {lancs.filter(l=>l.tipo==='receita'&&l.status==='pago').reduce((a,l)=>a+l.valor,0) - lancs.filter(l=>l.tipo==='despesa'&&l.status==='pago').reduce((a,l)=>a+l.valor,0)}</div></div>
          </div>

          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><b>Fluxo Ultimos 7 dias</b><span style={{fontSize:11,opacity:.5}}>Receitas - Despesas por dia</span></div>
            {lancs.length===0 ? <div style={{textAlign:'center',padding:20,opacity:.5}}>Nenhum lancamento ainda. Clique em Lancamentos - Novo Lancamento para comecar.</div> :
            <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120}}>
              {grafico.map((g,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><div style={{width:'100%',background:g.valor>=0?'#34d399':'#f87171',height:Math.max(4, Math.abs(g.valor)/maxGraf*90)+'px',borderRadius:8}}></div><div style={{fontSize:10,opacity:.6}}>{g.data}</div><div style={{fontSize:10,fontWeight:700}}>{g.valor>0?'+':''}{g.valor}</div></div>)}
            </div>}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="card"><div style={{display:'flex',justifyContent:'space-between'}}><b>Vencendo Hoje</b><span style={{fontSize:11,background:'#fef3c7',padding:'4px 8px',borderRadius:999}}>{lancs.filter(l=>l.status!=='pago').length} pendencias</span></div><div style={{marginTop:10}}>{lancs.filter(l=>l.status!=='pago').length===0?<div style={{opacity:.5,fontSize:13,padding:'10px 0'}}>Nenhuma pendencia - tudo zerado!</div>:lancs.filter(l=>l.status!=='pago').map(l=><div key={l.id} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderTop:'1px solid #eee'}}><div><div style={{fontWeight:700,fontSize:13}}>{l.descricao}</div><div style={{fontSize:11,opacity:.6}}>{l.vencimento} - {l.forma} - {l.banco}</div></div><div style={{display:'flex',gap:8,alignItems:'center'}}><b>R$ {l.valor}</b><button onClick={()=>apagarLanc(l.id)} style={{border:'none',background:'#fee2e2',color:'#dc2626',borderRadius:999,width:28,height:28,cursor:'pointer'}}>🗑️</button></div></div>)}</div></div>
            <div className="card"><b>Estoque Critico</b><div style={{marginTop:10}}>{prods.filter(p=>p.estoque < Number(p.minimo)).length===0?<div style={{opacity:.5,fontSize:13,padding:'10px 0'}}>Estoque ok - tudo zerado!</div>:prods.filter(p=>p.estoque < Number(p.minimo)).map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid #eee'}}><div style={{fontWeight:700,fontSize:13}}>{p.nome}</div><div style={{color:'#dc2626',fontWeight:800}}>{p.estoque} {p.unidade}</div></div>)}</div></div>
          </div>
        </div>}

        {tab==='lancar' && <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}><h2 style={{margin:0}}>Lancamentos</h2><div style={{display:'flex',gap:8}}><button className="btn2" onClick={exportarLanc}>📥 Exportar Planilha</button><button className="btn" onClick={()=>setShowForm(true)}>+ Novo Lancamento</button></div></div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>{lancs.length===0?<div style={{padding:40,textAlign:'center',opacity:.5}}>Nenhum lancamento. Seu financeiro esta zerado, pronto para comecar! Clique em + Novo Lancamento</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead style={{background:'#f8fafc',fontSize:11}}><tr><th style={{padding:12,textAlign:'left'}}>Descricao</th><th>Data</th><th>Forma</th><th>Banco</th><th style={{textAlign:'right'}}>Valor</th><th></th></tr></thead><tbody>{lancs.map(l=><tr key={l.id} style={{borderTop:'1px solid #eee'}}><td style={{padding:12}}><div style={{fontWeight:700}}>{l.descricao}</div><div style={{fontSize:11,opacity:.5}}>{l.fornecedor} - {l.status}</div></td><td style={{textAlign:'center'}}>{l.data.slice(5,10)}</td><td style={{textAlign:'center'}}>{l.forma}</td><td style={{textAlign:'center'}}>{l.banco}</td><td style={{textAlign:'right',fontWeight:800, color:l.tipo==='receita'?'#059669':'#0f172a'}}>{l.tipo==='receita'?'+':'-'} R$ {l.valor}</td><td style={{textAlign:'center'}}><button onClick={()=>apagarLanc(l.id)} style={{border:'none',background:'#fee2e2',color:'#dc2626',borderRadius:8,padding:'6px 10px',cursor:'pointer'}}>Apagar</button></td></tr>)}</tbody></table>}</div>
        </div>}

        {tab==='estoque' && <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}><h2 style={{margin:0}}>Produtos e Estoque</h2><div style={{display:'flex',gap:8}}><button className="btn2" onClick={exportarProd}>📥 Exportar Planilha</button><button className="btn" onClick={()=>setShowProd(true)}>+ Novo Produto</button></div></div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>{prods.length===0?<div style={{padding:40,textAlign:'center',opacity:.5}}>Nenhum produto. Estoque zerado, pronto para cadastrar seus frios e materiais!</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead style={{background:'#f8fafc',fontSize:11}}><tr><th style={{padding:12,textAlign:'left'}}>Produto</th><th>Estoque</th><th>Validade</th><th style={{textAlign:'right'}}>Preco</th><th></th></tr></thead><tbody>{prods.map(p=><tr key={p.id} style={{borderTop:'1px solid #eee'}}><td style={{padding:12}}><div style={{fontWeight:700}}>{p.nome}</div><div style={{fontSize:11,opacity:.5}}>{p.sku}</div></td><td style={{textAlign:'center',fontWeight:700,color:Number(p.estoque)<Number(p.minimo)?'#dc2626':'black'}}>{p.estoque} {p.unidade}</td><td style={{textAlign:'center'}}>{p.validade}</td><td style={{textAlign:'right'}}>C:{p.custo} / V:{p.venda}</td><td style={{textAlign:'center'}}><button onClick={()=>apagarProd(p.id)} style={{border:'none',background:'#fee2e2',color:'#dc2626',borderRadius:8,padding:'6px 10px',cursor:'pointer'}}>Apagar</button></td></tr>)}</tbody></table>}</div>
        </div>}
      </div>

      {showForm && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:99}}><div className="card" style={{width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'auto'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><b>Novo Lancamento</b><button onClick={()=>setShowForm(false)} style={{border:'none',background:'#eee',borderRadius:999,width:28,height:28,cursor:'pointer'}}>X</button></div><div style={{display:'grid',gap:10}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><button onClick={()=>setForm({...form,tipo:'receita'})} style={{padding:12,borderRadius:12,border:'1px solid #ddd',cursor:'pointer',background:form.tipo==='receita'?'#059669':'#eee',color:form.tipo==='receita'?'white':'black',fontWeight:700}}>Receita</button><button onClick={()=>setForm({...form,tipo:'despesa'})} style={{padding:12,borderRadius:12,border:'1px solid #ddd',cursor:'pointer',background:form.tipo==='despesa'?'#0f172a':'#eee',color:form.tipo==='despesa'?'white':'black',fontWeight:700}}>Despesa</button></div><input placeholder="Descricao ex: Compra queijo" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input type="number" placeholder="Valor R$" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}/><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="atrasado">Atrasado</option></select></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/><input type="date" value={form.vencimento} onChange={e=>setForm({...form,vencimento:e.target.value})}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><select value={form.forma} onChange={e=>setForm({...form,forma:e.target.value})}><option>PIX</option><option>Dinheiro</option><option>Cartao Credito</option><option>Cartao Debito</option><option>Boleto</option><option>Transferencia</option><option>Crediario</option></select><select value={form.banco} onChange={e=>setForm({...form,banco:e.target.value})}><option>Caixa Loja</option><option>Banco do Brasil</option><option>Bradesco</option><option>Inter</option><option>Nubank</option><option>Caixa Economica</option></select></div><input placeholder="Fornecedor / Cliente" value={form.fornecedor} onChange={e=>setForm({...form,fornecedor:e.target.value})}/><button className="btn" onClick={()=>{if(!form.descricao||!form.valor)return alert('Preencha descricao e valor'); setLancs([{id:Date.now().toString(),...form,valor:Number(form.valor)},...lancs]); setShowForm(false); setForm({...form,descricao:'',valor:'',fornecedor:''});}}>Salvar Lancamento</button></div></div></div>}

      {showProd && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:99}}><div className="card" style={{width:'100%',maxWidth:520}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><b>Novo Produto / Material</b><button onClick={()=>setShowProd(false)} style={{border:'none',background:'#eee',borderRadius:999,width:28,height:28,cursor:'pointer'}}>X</button></div><div style={{display:'grid',gap:10}}><input placeholder="Nome ex: Mussarela Fatiada" value={pform.nome} onChange={e=>setPform({...pform,nome:e.target.value})}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}><input placeholder="Custo" type="number" value={pform.custo} onChange={e=>setPform({...pform,custo:e.target.value})}/><input placeholder="Venda" type="number" value={pform.venda} onChange={e=>setPform({...pform,venda:e.target.value})}/><input placeholder="Estoque" type="number" value={pform.estoque} onChange={e=>setPform({...pform,estoque:e.target.value})}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input placeholder="Minimo" type="number" value={pform.minimo} onChange={e=>setPform({...pform,minimo:e.target.value})}/><input type="date" value={pform.validade} onChange={e=>setPform({...pform,validade:e.target.value})}/></div><input placeholder="Unidade ex: kg, un" value={pform.unidade} onChange={e=>setPform({...pform,unidade:e.target.value})}/><button className="btn" onClick={()=>{if(!pform.nome)return alert('Nome obrigatorio'); setProds([{id:Date.now().toString(),nome:pform.nome,sku:'SKU-'+Date.now().toString().slice(-4),custo:Number(pform.custo||0),venda:Number(pform.venda||0),estoque:Number(pform.estoque||0),minimo:Number(pform.minimo||0),validade:pform.validade,unidade:pform.unidade||'un'},...prods]); setShowProd(false); setPform({nome:'',custo:'',venda:'',estoque:'',minimo:'5',validade:new Date().toISOString().slice(0,10),unidade:'kg'});}}>Salvar Produto</button></div></div></div>}
    </div>
  );
}

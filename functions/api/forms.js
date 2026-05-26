function corsHeaders(){
  return {
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, Accept'
  };
}

function escapeHtml(value = ''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

async function readRequestData(request){
  const contentType = request.headers.get('content-type') || '';

  if(contentType.includes('application/json')){
    return await request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

async function sendEmail(env,payload){
  return fetch(
    'https://api.resend.com/emails',
    {
      method:'POST',
      headers:{
        'Authorization':`Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify(payload)
    }
  );
}

function buildHtml(title,fields){
  return `
    <div style="
      font-family:Arial,sans-serif;
      max-width:720px;
      margin:auto;
      padding:24px;
      color:#222;
      line-height:1.5;
    ">
      <h1 style="margin:0 0 18px;">${escapeHtml(title)}</h1>
      <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">
      ${fields.map(field => `
        <p style="margin:0 0 16px;">
          <strong>${escapeHtml(field.label)}:</strong><br>
          ${escapeHtml(field.value || '-')}
        </p>
      `).join('')}
    </div>
  `;
}

function basePayload(data,subject,title,fields){
  return {
    from:'Rota do Ouro Verde <contato@rotaouroverde.com.br>',
    to:['rotaourovede@gmail.com'],
    reply_to:data.email || undefined,
    subject,
    html:buildHtml(title,fields)
  };
}

export async function onRequest(context){
  const { request, env } = context;

  if(request.method === 'OPTIONS'){
    return new Response(null,{ headers:corsHeaders() });
  }

  if(request.method !== 'POST'){
    return new Response('Método não permitido',{ status:405, headers:corsHeaders() });
  }

  try{
    const data = await readRequestData(request);

    if(data._gotcha){
      return new Response(JSON.stringify({ success:true }),{ status:200, headers:corsHeaders() });
    }

    let payload = null;

    switch(data.tipo){
      case 'contato':
        payload = basePayload(
          data,
          'Novo contato pelo site',
          'Novo contato recebido',
          [
            { label:'Nome', value:data.nome },
            { label:'E-mail', value:data.email },
            { label:'Assunto/interesse', value:data.interesse },
            { label:'Mensagem', value:data.mensagem || data.observacoes }
          ]
        );
      break;

      case 'evento':
        payload = basePayload(
          data,
          `Nova inscrição em evento - ${data.evento || 'Evento'}`,
          'Nova inscrição em evento',
          [
            { label:'Evento', value:data.evento },
            { label:'Nome', value:data.nome },
            { label:'E-mail', value:data.email },
            { label:'WhatsApp', value:data.whatsapp || data.telefone },
            { label:'Cidade', value:data.cidade },
            { label:'Experiência em trilhas', value:data.experiencia },
            { label:'Experiência em escalada', value:data.experiencia_escalada },
            { label:'Participantes', value:data.participantes },
            { label:'Observações', value:data.observacoes || data.mensagem }
          ]
        );
      break;

      case 'inscricao-trilha':
        payload = basePayload(
          data,
          `Nova inscrição - ${data.percurso || 'Percurso'}`,
          'Nova inscrição recebida',
          [
            { label:'Percurso', value:data.percurso },
            { label:'Nome', value:data.nome },
            { label:'WhatsApp', value:data.whatsapp },
            { label:'E-mail', value:data.email },
            { label:'Cidade/Estado', value:data.cidade_estado || data.cidade },
            { label:'Data inicial', value:data.data_inicio },
            { label:'Data final', value:data.data_fim },
            { label:'Contato de emergência', value:data.contato_emergencia },
            { label:'Telefone de emergência', value:data.telefone_emergencia },
            { label:'Experiência', value:data.experiencia },
            { label:'Observações', value:data.observacoes }
          ]
        );
      break;

      default:
        return new Response(
          JSON.stringify({ error:'Tipo de formulário inválido' }),
          { status:400, headers:corsHeaders() }
        );
    }

    const resendResponse = await sendEmail(env,payload);
    const result = await resendResponse.text();

    return new Response(result,{ status:resendResponse.status, headers:corsHeaders() });

  }catch(error){
    return new Response(
      JSON.stringify({ error:error.message }),
      { status:500, headers:corsHeaders() }
    );
  }
}

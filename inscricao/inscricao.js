
const routeId =
  new URLSearchParams(window.location.search)
    .get('route');

async function loadRoute(){

  try{

    const response =
      await fetch('../data/percursos.json');

    const data =
      await response.json();

    const routes =
      data.routes || [];

    const route =
      routes.find(item => item.id === routeId);

    if(!route) return;

    const hero =
      document.querySelector('.inscricao-hero,.thanks-hero');

    if(hero){

      hero.style.backgroundImage =
        `linear-gradient(
          to bottom,
          rgba(0,0,0,.82),
          rgba(0,0,0,.55)
        ),
        url('../${route.cover}')`;

    }

    const title =
      document.getElementById('route-title');

    const desc =
      document.getElementById('route-description');

    const summaryTitle =
      document.getElementById('summary-title');

    if(title)
      title.textContent = route.title;

    if(desc)
      desc.textContent = route.description;

    if(summaryTitle)
      summaryTitle.textContent = route.title;

    const distance =
      document.getElementById('summary-distance');

    const duration =
      document.getElementById('summary-duration');

    const difficulty =
      document.getElementById('summary-difficulty');

    const price =
      document.getElementById('summary-price');

    if(distance)
      distance.textContent = route.distance || '--';

    if(duration)
      duration.textContent = route.duration || '--';

    if(difficulty)
      difficulty.textContent = route.difficulty || '--';

    if(price)
      price.textContent = route.price || '--';
    
    const routeSelect =
      document.getElementById('route-select');

      if(routeSelect){

        routeSelect.innerHTML = '';

        const option =
          document.createElement('option');

          option.value =
          route.title || routeId || 'Percurso';

          option.textContent =
          route.title || routeId || 'Percurso';

          option.selected = true;

      routeSelect.appendChild(option);

    }


    const thanksTitle =
      document.getElementById('thanks-title');

    const thanksDescription =
      document.getElementById('thanks-description');

    if(thanksTitle){

      thanksTitle.textContent =
        `Inscrição recebida para ${route.title}`;

    }

    if(thanksDescription){

      thanksDescription.textContent =
        `Recebemos sua pré-inscrição para ${route.title}.`;

    }

    }catch(error){

    console.error(error);

  }

}

loadRoute();

const form =
  document.getElementById('formulario');

function setError(input,message){

  input.classList.add('input-error');
  input.classList.remove('input-valid');

  const error =
    input.parentElement.querySelector('.field-error');

  if(error){

    error.style.display = 'block';
    error.textContent = message;

  }

}

function clearError(input){

  input.classList.remove('input-error');
  input.classList.add('input-valid');

  const error =
    input.parentElement.querySelector('.field-error');

  if(error){

    error.style.display = 'none';

  }

}

function onlyNumbers(value){

  return value.replace(/\D/g,'');

}

function validateEmail(value){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

}

function validatePhone(value){

  const numbers =
    onlyNumbers(value);

  return numbers.length >= 10 &&
         numbers.length <= 11;

}

if(form){

  form.addEventListener('submit', async event => {

    event.preventDefault();

    let valid = true;

    const startDate =
      document.getElementById('trail-start');

    const endDate =
      document.getElementById('trail-end');

    const fullName =
      document.getElementById('full-name');

    const whatsapp =
      document.getElementById('whatsapp');

    const email =
      document.getElementById('email');

    const city =
      document.getElementById('city');

    const emergencyContact =
      document.getElementById('emergency-contact');

    const emergencyPhone =
      document.getElementById('emergency-phone');

    const acceptTerms =
      document.getElementById('accept-terms');

    if(!startDate.value){

      valid = false;

      setError(
        startDate,
        'Selecione a data inicial.'
      );

    }else{

      clearError(startDate);

    }

    if(!endDate.value){

      valid = false;

      setError(
        endDate,
        'Selecione a data final.'
      );

    }else if(endDate.value < startDate.value){

      valid = false;

      setError(
        endDate,
        'A data final não pode ser menor que a inicial.'
      );

    }else{

      clearError(endDate);

    }

    if(fullName.value.trim().length < 5){

      valid = false;

      setError(
        fullName,
        'Digite seu nome completo.'
      );

    }else{

      clearError(fullName);

    }

    if(!validatePhone(whatsapp.value)){

      valid = false;

      setError(
        whatsapp,
        'Digite um WhatsApp válido com DDD.'
      );

    }else{

      clearError(whatsapp);

    }

    if(!validateEmail(email.value)){

      valid = false;

      setError(
        email,
        'Digite um e-mail válido.'
      );

    }else{

      clearError(email);

    }

    if(city.value.trim().length < 3){

      valid = false;

      setError(
        city,
        'Informe sua cidade e estado.'
      );

    }else{

      clearError(city);

    }

    if(
      emergencyPhone.value.trim() &&
      !validatePhone(emergencyPhone.value)
    ){

      valid = false;

      setError(
        emergencyPhone,
        'Digite um telefone válido com DDD.'
      );

    }else{

      clearError(emergencyPhone);

    }

    if(
      emergencyPhone.value.trim() &&
      emergencyContact.value.trim().length < 3
    ){

      valid = false;

      setError(
        emergencyContact,
        'Informe o contato de emergência.'
      );

    }else{

      clearError(emergencyContact);

    }

    if(!acceptTerms.checked){

      valid = false;

      alert(
        'Você precisa concordar com o Termo de Responsabilidade.'
      );

    }

    if(!valid){
      return;
    }

    try{

      const response = await fetch(
        form.action,
        {
          method:'POST',
          body:new FormData(form),
          headers:{
            'Accept':'application/json'
        }
      }
    );

    if(response.ok){

      window.location.href =
        `./obrigado.html?type=route&route=${encodeURIComponent(routeId)}`;

    }else{

      alert(
        'Não foi possível enviar sua inscrição.'
      );

    }

  }catch(error){

    console.error(error);

    alert(
      'Erro ao enviar inscrição.'
    );

  }

  });

}

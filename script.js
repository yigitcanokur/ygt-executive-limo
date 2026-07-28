const header=document.querySelector('.site-header');const menuBtn=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>30));menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');document.body.classList.toggle('menu-open',open);menuBtn.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');document.body.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false')}));const dateInput=document.getElementById('date');if(dateInput){const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());dateInput.min=today.toISOString().split('T')[0]}document.getElementById('bookingForm').addEventListener('submit',function(e){e.preventDefault();const v=id=>document.getElementById(id).value;const msg=`Hello YGT Executive Limo, I would like to request availability.

Name: ${v('name')}
Phone: ${v('phone')}
Service: ${v('service')}
Pickup: ${v('pickup')}
Drop-off: ${v('dropoff')}
Date: ${v('date')}
Time: ${v('time')}
Vehicle: ${v('vehicle')}
Passengers: ${v('passengers')}
Luggage: ${v('luggage')}`;window.open('https://wa.me/12018971912?text='+encodeURIComponent(msg),'_blank','noopener')});
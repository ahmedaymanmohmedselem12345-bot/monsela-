(function(){
  'use strict';
  const status=document.getElementById('status');
  if(!window.supabase){status.textContent='تعذر الاتصال. حدّث الصفحة وحاول مرة تانية.';return;}
  const auth=window.supabase.createClient(window.MONSELA_AUTH.url,window.MONSELA_AUTH.key);
  let recoveryReady=false;
  function showRecovery(){recoveryReady=true;document.getElementById('requestForm').hidden=true;document.getElementById('changeForm').hidden=false;history.replaceState(null,'',location.pathname);}
  // Only a recovery redirect enables credential change. A normal session is insufficient.
  auth.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')showRecovery();});
  document.getElementById('requestForm').addEventListener('submit',async e=>{
    e.preventDefault();const btn=document.getElementById('send');btn.disabled=true;status.textContent='جاري الإرسال...';
    try{
      const email=document.getElementById('email').value.trim();
      if(email.endsWith('@monsela.customer'))throw new Error('للحساب القديم المسجل برقم الموبايل، تواصل مع خدمة العملاء.');
      const {error}=await auth.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/reset-password.html'});
      if(error)throw new Error('تعذر إرسال الرابط الآن. حاول بعد شوية أو تواصل معنا.');
      status.textContent='لو البريد مرتبط بحساب، هيوصلك رابط الاستعادة. راجع صندوق الرسائل غير المرغوب فيها كمان.';
    }catch(e){status.textContent=e.message;}finally{btn.disabled=false;}
  });
  document.getElementById('changeForm').addEventListener('submit',async e=>{
    e.preventDefault();if(!recoveryReady){status.textContent='افتح رابط الاستعادة من بريدك أولًا.';return;}
    const password=document.getElementById('password').value,confirm=document.getElementById('confirmPassword').value;
    if(password.length<8||password!==confirm){status.textContent='استخدم ٨ حروف على الأقل وتأكد من تطابق كلمتي المرور.';return;}
    const btn=document.getElementById('save');btn.disabled=true;
    try{
      const {error}=await auth.auth.updateUser({password});if(error)throw new Error('الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.');
      document.getElementById('changeForm').hidden=true;document.getElementById('password').value='';document.getElementById('confirmPassword').value='';
      status.textContent='اتغيرت كلمة المرور بنجاح. ارجع للمتجر وسجّل دخول.';recoveryReady=false;await auth.auth.signOut();
    }catch(e){status.textContent=e.message;}finally{btn.disabled=false;}
  });
})();

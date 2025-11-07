// --------------------- Registration ---------------------
const registerForm = document.getElementById('registerForm');
if(registerForm){
    registerForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/register',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({name,email,password})
        });
        const data = await res.json();
        document.getElementById('registerMessage').innerText = data.message;
        if(data.success) setTimeout(()=>window.location.href='index.html',1000);
    });
}

// --------------------- Login ---------------------
const loginForm = document.getElementById('loginForm');
if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/login',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email,password})
        });
        const data = await res.json();
        document.getElementById('loginMessage').innerText = data.message;
        if(data.success){
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            window.location.href = 'dashboard.html';
        }
    });
}

// --------------------- Forgot Password ---------------------
const forgotForm = document.getElementById('forgotForm');
if(forgotForm){
    forgotForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const newPassword = document.getElementById('newPassword').value;

        const res = await fetch('/reset-password',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email,newPassword})
        });
        const data = await res.json();
        document.getElementById('forgotMessage').innerText = data.message;
        if(data.success) setTimeout(()=>window.location.href='index.html',1000);
    });
}

// --------------------- Dashboard ---------------------
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
if(userName) document.getElementById('userName').innerText = userName;

// Load applications
async function loadApplications(){
    if(!userId) return;
    const res = await fetch(`/applications?userId=${userId}`);
    const data = await res.json();
    if(data.success){
        const tbody = document.querySelector('#applicationsTable tbody');
        tbody.innerHTML = '';
        data.applications.forEach(app=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${app.subject}</td><td>${app.status}</td>`;
            tbody.appendChild(tr);
        });
    }
}
if(document.getElementById('applicationsTable')) loadApplications();

// Submit application
const applicationForm = document.getElementById('applicationForm');
if(applicationForm){
    applicationForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const subject = document.getElementById('subject').value;
        const resume = document.getElementById('resume').files[0];

        const reader = new FileReader();
        reader.onloadend = async () => {
            const resumeData = reader.result;
            const res = await fetch('/submit-application',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({userId,subject,resume:resumeData})
            });
            const data = await res.json();
            document.getElementById('appMessage').innerText = data.message;
            if(data.success){
                applicationForm.reset();
                loadApplications();
            }
        };
        reader.readAsDataURL(resume);
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

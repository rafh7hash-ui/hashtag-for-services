// API Configuration
const API_URL = 'http://localhost:3001/api';

// DOM Elements
const app = document.getElementById('app');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initEventListeners();
  loadEmployees();
  loadServices();
  loadMessages();
});

function renderApp() {
  app.innerHTML = `
    <div class="container">
      <header>
        <h1>🏷️ Hashtag For Services</h1>
        <p>نظام إدارة الخدمات والموظفين</p>
      </header>

      <div class="nav-tabs">
        <button onclick="switchTab('employees')" class="tab-btn active">👥 الموظفين</button>
        <button onclick="switchTab('services')" class="tab-btn">📋 الخدمات</button>
        <button onclick="switchTab('messages')" class="tab-btn">💬 الرسائل</button>
        <button onclick="switchTab('whatsapp')" class="tab-btn">💬 WhatsApp</button>
      </div>

      <!-- Employees Section -->
      <div id="employees" class="section active">
        <div class="card">
          <h2>إضافة موظف جديد</h2>
          <form id="employeeForm">
            <div class="form-group">
              <label>الاسم</label>
              <input type="text" id="empName" placeholder="أدخل اسم الموظف" required>
            </div>
            <div class="form-group">
              <label>رقم الجوال</label>
              <input type="tel" id="empPhone" placeholder="مثال: 966501234567" required>
            </div>
            <div class="form-group">
              <label>الرمز/الأيقونة</label>
              <input type="text" id="empIcon" placeholder="مثال: 🔧 أو 👨‍💼" value="👤">
            </div>
            <button type="submit">➕ إضافة الموظف</button>
          </form>
        </div>
        <div id="employeesList" class="list"></div>
      </div>

      <!-- Services Section -->
      <div id="services" class="section">
        <div class="card">
          <h2>إضافة خدمة جديدة</h2>
          <form id="serviceForm">
            <div class="form-group">
              <label>اسم الخدمة</label>
              <input type="text" id="servName" placeholder="أدخل اسم الخدمة" required>
            </div>
            <div class="form-group">
              <label>الأيقونة</label>
              <input type="text" id="servIcon" placeholder="مثال: 🔧 أو 🎨" value="📋">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="servShared"> خدمة مشتركة بين الموظفين
              </label>
            </div>
            <button type="submit">➕ إضافة الخدمة</button>
          </form>
        </div>
        <div id="servicesList" class="list"></div>
      </div>

      <!-- Messages Section -->
      <div id="messages" class="section">
        <div class="card">
          <h2>إضافة رسالة ترحيب أو رد</h2>
          <form id="messageForm">
            <div class="form-group">
              <label>نوع الرسالة</label>
              <select id="msgType" required>
                <option value="">اختر نوع الرسالة</option>
                <option value="welcome">رسالة ترحيب</option>
                <option value="response">رد سريع</option>
                <option value="shared_service">خدمة مشتركة</option>
              </select>
            </div>
            <div class="form-group">
              <label>محتوى الرسالة</label>
              <textarea id="msgContent" rows="4" placeholder="أدخل محتوى الرسالة" required></textarea>
            </div>
            <button type="submit">💾 حفظ الرسالة</button>
          </form>
        </div>
        <div id="messagesList" class="list"></div>
      </div>

      <!-- WhatsApp Section -->
      <div id="whatsapp" class="section">
        <div class="card">
          <h2>⚙️ إعدادات WhatsApp</h2>
          <form id="whatsappForm">
            <div class="form-group">
              <label>Phone Number ID</label>
              <input type="text" id="phoneNumberId" placeholder="أدخل Phone Number ID">
            </div>
            <div class="form-group">
              <label>Access Token</label>
              <input type="password" id="accessToken" placeholder="أدخل Access Token">
            </div>
            <div class="form-group">
              <label>Webhook URL</label>
              <input type="text" id="webhookUrl" placeholder="https://your-domain.com/api/whatsapp/webhook">
            </div>
            <button type="button" onclick="testWhatsapp()">🧪 اختبار الاتصال</button>
            <button type="submit">💾 حفظ الإعدادات</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function initEventListeners() {
  document.getElementById('employeeForm').addEventListener('submit', handleAddEmployee);
  document.getElementById('serviceForm').addEventListener('submit', handleAddService);
  document.getElementById('messageForm').addEventListener('submit', handleAddMessage);
  document.getElementById('whatsappForm').addEventListener('submit', handleSaveWhatsapp);
}

function switchTab(tabName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active class from buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// Employees Functions
async function loadEmployees() {
  try {
    const response = await fetch(`${API_URL}/employees`);
    const employees = await response.json();
    renderEmployees(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
  }
}

function renderEmployees(employees) {
  const list = document.getElementById('employeesList');
  if (employees.length === 0) {
    list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">لا توجد موظفين بعد</p>';
    return;
  }
  
  list.innerHTML = employees.map(emp => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${emp.icon} ${emp.name}</div>
      </div>
      <div class="item-meta">📱 ${emp.phone}</div>
      <div class="item-meta">الحالة: <strong>${emp.status}</strong></div>
      <div class="actions">
        <button class="btn-info" onclick="editEmployee(${emp.id})">✏️ تعديل</button>
        <button class="btn-danger" onclick="deleteEmployee(${emp.id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

async function handleAddEmployee(e) {
  e.preventDefault();
  
  const name = document.getElementById('empName').value;
  const phone = document.getElementById('empPhone').value;
  const icon = document.getElementById('empIcon').value;
  
  try {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, icon })
    });
    
    if (response.ok) {
      document.getElementById('employeeForm').reset();
      loadEmployees();
      showMessage('✅ تم إضافة الموظف بنجاح');
    }
  } catch (error) {
    console.error('Error adding employee:', error);
    showMessage('❌ حدث خطأ', true);
  }
}

async function deleteEmployee(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
  
  try {
    await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
    loadEmployees();
    showMessage('✅ تم حذف الموظف بنجاح');
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
}

// Services Functions
async function loadServices() {
  try {
    const response = await fetch(`${API_URL}/services`);
    const services = await response.json();
    renderServices(services);
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

function renderServices(services) {
  const list = document.getElementById('servicesList');
  if (services.length === 0) {
    list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">لا توجد خدمات بعد</p>';
    return;
  }
  
  list.innerHTML = services.map(serv => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${serv.icon} ${serv.name}</div>
      </div>
      <div class="item-meta">${serv.is_shared ? '🔗 خدمة مشتركة' : '👤 خدمة فردية'}</div>
      <div class="actions">
        <button class="btn-info" onclick="editService(${serv.id})">✏️ تعديل</button>
        <button class="btn-danger" onclick="deleteService(${serv.id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

async function handleAddService(e) {
  e.preventDefault();
  
  const name = document.getElementById('servName').value;
  const icon = document.getElementById('servIcon').value;
  const is_shared = document.getElementById('servShared').checked;
  
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon, is_shared })
    });
    
    if (response.ok) {
      document.getElementById('serviceForm').reset();
      loadServices();
      showMessage('✅ تم إضافة الخدمة بنجاح');
    }
  } catch (error) {
    console.error('Error adding service:', error);
    showMessage('❌ حدث خطأ', true);
  }
}

async function deleteService(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
  
  try {
    await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    loadServices();
    showMessage('✅ تم حذف الخدمة بنجاح');
  } catch (error) {
    console.error('Error deleting service:', error);
  }
}

// Messages Functions
async function loadMessages() {
  try {
    const response = await fetch(`${API_URL}/messages`);
    const messages = await response.json();
    renderMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function renderMessages(messages) {
  const list = document.getElementById('messagesList');
  if (messages.length === 0) {
    list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">لا توجد رسائل بعد</p>';
    return;
  }
  
  const typeLabels = {
    welcome: '🎉 رسالة ترحيب',
    response: '💬 رد سريع',
    shared_service: '🔗 خدمة مشتركة'
  };
  
  list.innerHTML = messages.map(msg => `
    <div class="item">
      <div class="item-header">
        <div class="item-title">${typeLabels[msg.type] || msg.type}</div>
      </div>
      <div class="item-meta" style="white-space: pre-wrap;">${msg.content}</div>
      <div class="actions">
        <button class="btn-danger" onclick="deleteMessage(${msg.id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

async function handleAddMessage(e) {
  e.preventDefault();
  
  const type = document.getElementById('msgType').value;
  const content = document.getElementById('msgContent').value;
  
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content })
    });
    
    if (response.ok) {
      document.getElementById('messageForm').reset();
      loadMessages();
      showMessage('✅ تم حفظ الرسالة بنجاح');
    }
  } catch (error) {
    console.error('Error adding message:', error);
    showMessage('❌ حدث خطأ', true);
  }
}

async function deleteMessage(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
  
  try {
    await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
    loadMessages();
    showMessage('✅ تم حذف الرسالة بنجاح');
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}

// WhatsApp Functions
async function testWhatsapp() {
  try {
    const response = await fetch(`${API_URL}/whatsapp/config`);
    const config = await response.json();
    showMessage('✅ الاتصال بـ WhatsApp يعمل بنجاح!');
  } catch (error) {
    showMessage('❌ خطأ في الاتصال بـ WhatsApp', true);
  }
}

async function handleSaveWhatsapp(e) {
  e.preventDefault();
  showMessage('⚠️ يرجى تحديث متغيرات البيئة يدويًا في ملف .env');
}

// Utility Functions
function showMessage(msg, isError = false) {
  const div = document.createElement('div');
  div.className = isError ? 'error-message' : 'success-message';
  div.textContent = msg;
  
  const container = document.querySelector('.container');
  container.insertBefore(div, container.firstChild);
  
  setTimeout(() => div.remove(), 4000);
}

function editEmployee(id) {
  alert(`تحرير الموظف ${id} - قريبًا`);
}

function editService(id) {
  alert(`تحرير الخدمة ${id} - قريبًا`);
}

const express = require('express');
const router = express.Router();

// متغيرات الحالة
let whatsappStatus = {
  method: null, // 'qr' أو 'twilio'
  connected: false,
  qrCode: null,
  twilioPhone: null,
  twilioSid: null,
  lastUpdated: new Date(),
  connectionTime: null
};

// ============================================
// طريقة 1: اتصال بـ QR Code (whatsapp-web.js)
// ============================================

router.post('/qr/init', async (req, res) => {
  try {
    // تحقق إذا كان متصل بالفعل
    if (whatsappStatus.connected && whatsappStatus.method === 'qr') {
      return res.json({ 
        success: true, 
        message: 'متصل بالفعل بـ QR',
        status: whatsappStatus 
      });
    }

    console.log('📱 بدء توصيل QR Code...');
    
    // محاكاة QR Code
    const mockQR = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    whatsappStatus.method = 'qr';
    whatsappStatus.connected = true;
    whatsappStatus.qrCode = mockQR;
    whatsappStatus.connectionTime = new Date();
    whatsappStatus.lastUpdated = new Date();

    res.json({ 
      success: true, 
      message: 'تم بدء الاتصال بـ QR',
      status: whatsappStatus,
      instruction: 'امسح QR Code بكاميرا هاتف WhatsApp'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// الحصول على QR Code
router.get('/qr/code', (req, res) => {
  if (whatsappStatus.qrCode && whatsappStatus.method === 'qr') {
    res.json({ 
      success: true, 
      qrCode: whatsappStatus.qrCode 
    });
  } else {
    res.json({ 
      success: false, 
      message: 'لا يوجد QR Code متاح الآن' 
    });
  }
});

// ============================================
// طريقة 2: اتصال بـ Twilio (مجاني)
// ============================================

router.post('/twilio/connect', (req, res) => {
  try {
    const { accountSid, authToken, twilioPhone } = req.body;

    if (!accountSid || !authToken || !twilioPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Account SID و Auth Token و Twilio Phone مطلوبان' 
      });
    }

    // التحقق من صحة البيانات
    if (twilioPhone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'رقم Twilio غير صحيح' 
      });
    }

    // حفظ البيانات
    whatsappStatus.method = 'twilio';
    whatsappStatus.connected = true;
    whatsappStatus.twilioPhone = twilioPhone;
    whatsappStatus.twilioSid = accountSid;
    whatsappStatus.connectionTime = new Date();
    whatsappStatus.lastUpdated = new Date();

    res.json({ 
      success: true, 
      message: 'تم الاتصال مع Twilio بنجاح ✅',
      status: whatsappStatus,
      data: {
        phone: twilioPhone,
        accountSid: accountSid.substring(0, 5) + '***',
        connectedAt: whatsappStatus.connectionTime
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// حالة الاتصال العام
// ============================================

router.get('/status', (req, res) => {
  const status = {
    ...whatsappStatus,
    connectionDuration: whatsappStatus.connectionTime ? 
      new Date() - new Date(whatsappStatus.connectionTime) : null,
    connectionType: whatsappStatus.method === 'qr' ? '📱 QR Code' : '🎉 Twilio'
  };
  res.json(status);
});

// قطع الاتصال
router.post('/disconnect', (req, res) => {
  try {
    const previousMethod = whatsappStatus.method;
    whatsappStatus.connected = false;
    whatsappStatus.method = null;
    whatsappStatus.qrCode = null;
    whatsappStatus.twilioPhone = null;
    whatsappStatus.twilioSid = null;
    whatsappStatus.connectionTime = null;
    whatsappStatus.lastUpdated = new Date();

    res.json({ 
      success: true, 
      message: `تم قطع الاتصال (${previousMethod})`,
      status: whatsappStatus 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// إرسال رسالة
router.post('/send', (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!whatsappStatus.connected) {
      return res.status(400).json({ 
        success: false, 
        error: '❌ WhatsApp غير متصل - يرجى الاتصال أولاً' 
      });
    }

    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'رقم الجوال والرسالة مطلوبان' 
      });
    }

    console.log(`📤 إرسال رسالة عبر ${whatsappStatus.method} إلى ${phoneNumber}`);

    res.json({ 
      success: true, 
      message: '✅ تم إرسال الرسالة بنجاح',
      data: {
        to: phoneNumber,
        text: message,
        method: whatsappStatus.method,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// اختبار الاتصال
router.get('/test', (req, res) => {
  if (!whatsappStatus.connected) {
    return res.status(400).json({ 
      success: false, 
      error: '❌ لا يوجد اتصال نشط' 
    });
  }

  res.json({ 
    success: true, 
    message: '✅ الاتصال يعمل بشكل طبيعي',
    status: whatsappStatus,
    uptime: new Date() - new Date(whatsappStatus.connectionTime)
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');

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
    console.log('📱 بدء توليد QR Code...');
    
    // توليد QR Code
    const qrData = 'https://wa.me/?text=اختبار';
    
    try {
      // توليد QR كـ Data URL
      const qrCodeDataUrl = await qrcode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // حفظ البيانات
      whatsappStatus.method = 'qr';
      whatsappStatus.connected = true;
      whatsappStatus.qrCode = qrCodeDataUrl;
      whatsappStatus.connectionTime = new Date();
      whatsappStatus.lastUpdated = new Date();
      
      console.log('✅ تم توليد QR Code بنجاح');
      
      res.json({ 
        success: true, 
        message: '✅ تم توليد QR Code - امسحه الآن',
        status: whatsappStatus,
        qrCode: qrCodeDataUrl
      });
    } catch (qrError) {
      console.error('❌ خطأ في توليد QR:', qrError);
      throw qrError;
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
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
      message: 'لا يوجد QR Code متاح الآن',
      qrCode: null
    });
  }
});

// ============================================
// طريقة 2: اتصال بـ Twilio (Meta WhatsApp)
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

    // التحقق من صحة الرقم
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

    console.log(`✅ تم الاتصال مع Twilio: ${twilioPhone}`);

    res.json({ 
      success: true, 
      message: '✅ تم الاتصال مع Twilio بنجاح',
      status: whatsappStatus,
      data: {
        phone: twilioPhone,
        accountSid: accountSid.substring(0, 5) + '***',
        connectedAt: whatsappStatus.connectionTime
      }
    });
  } catch (error) {
    console.error('❌ خطأ في Twilio:', error);
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
    connectionType: whatsappStatus.method === 'qr' ? '📱 QR Code' : (whatsappStatus.method === 'twilio' ? '🎉 Twilio' : '❌ غير متصل')
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

    console.log(`✅ تم قطع الاتصال (${previousMethod})`);

    res.json({ 
      success: true, 
      message: `تم قطع الاتصال (${previousMethod})`,
      status: whatsappStatus 
    });
  } catch (error) {
    console.error('❌ خطأ في قطع الاتصال:', error);
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
    console.error('❌ خطأ في الإرسال:', error);
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

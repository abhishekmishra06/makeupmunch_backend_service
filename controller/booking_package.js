const Razorpay = require('razorpay')
const razorpay = new Razorpay({
key_id: 'rzp_test_V7YE34hqd60Jse   ',
   key_secret: 'Cq6iuPUAKBWPnDqFXEtuVS3d'
})




const bookingpayment =  async (req, res) => {


    console.log("hello world");
    // initializing razorpay
    const razorpay = new Razorpay({
        key_id: req.body.keyId,
        key_secret: req.body.keySecret,
    });

    // setting up options for razorpay order.
    const options = {
        amount: req.body.amount,  
        currency: req.body.currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1
    };
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
        })
    } catch (err) {
       res.status(400).send('Not able to create order. Please try again!');
    }
};

const verifyPayment = (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
  
    if (expectedSignature === razorpay_signature) {
      res.json({ status: 'success' });
    } else {
      res.json({ status: 'failure' });
    }
  };

  


  
  module.exports = bookingpayment;
  module.exports = verifyPayment;
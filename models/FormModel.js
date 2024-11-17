// Schema for form submissions
const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const FormModel = mongoose.models.FormSubmission || mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = FormModel;
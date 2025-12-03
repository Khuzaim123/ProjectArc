const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't include password in queries by default
        },
        avatar: {
            type: String,
            default: '',
        },
        workspaces: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Workspace',
            },
        ],
        notificationPreferences: {
            email: {
                type: Boolean,
                default: true,
            },
            push: {
                type: Boolean,
                default: false,
            },
            taskAssigned: {
                type: Boolean,
                default: true,
            },
            taskComment: {
                type: Boolean,
                default: true,
            },
            projectUpdate: {
                type: Boolean,
                default: true,
            },
            weeklyDigest: {
                type: Boolean,
                default: false,
            },
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationOTP: {
            type: String,
            select: false,
        },
        emailVerificationOTPExpiry: {
            type: Date,
            select: false,
        },
        resetPasswordOTP: {
            type: String,
            select: false,
        },
        resetPasswordOTPExpiry: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Convert to JSON and remove password
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

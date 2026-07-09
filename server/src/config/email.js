// import nodemailer from "nodemailer"
// // import dotenv from "dotenv"
// // dotenv.config()

// // Validate email config
// if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     console.error("❌ SMTP_USER and SMTP_PASS environment variables required")
// }

// const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     port: 587,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS 
//     }
// })

// // Test connection
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Email config error:", error.message)
//     } else if (process.env.NODE_ENV !== "production") {
//         console.log("✅ Email service ready")
//     }
// })

// export const sendVerificationEmail = async (email, name, token) => {
//     const verifyURL = `${process.env.CLIENT_URL}/verify-email/${token}`

//     const mailOptions = {
//         from: `"BlogApp" <${process.env.SMTP_USER}>`,
//         to: email,
//         subject: "BlogApp — Email Verify karo",
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
//                 <h2 style="color: #4f46e5;">BlogApp pe Swagat hai! 👋</h2>
//                 <p style="color: #555;">Namaste <strong>${name}</strong>,</p>
//                 <p style="color: #555;">Apna account verify karne ke liye neeche button click karo:</p>
//                 <a href="${verifyURL}"
//                     style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
//                     ✅ Email Verify karo
//                 </a>
//                 <p style="color: #999; font-size: 13px;">Yeh link 24 ghante mein expire ho jaayega.</p>
//                 <p style="color: #999; font-size: 13px;">Agar tumne register nahi kiya toh is email ko ignore karo.</p>
//                 <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                 <p style="color: #ccc; font-size: 12px;">BlogApp Team</p>
//             </div>
//         `
//     }

//     await transporter.sendMail(mailOptions)
// }

// export const sendPasswordResetEmail = async (email, name, token) => {
//     const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`

//     const mailOptions = {
//         from: `"BlogApp" <${process.env.SMTP_USER}>`,
//         to: email,
//         subject: "BlogApp — Password Reset",
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
//                 <h2 style="color: #4f46e5;">Password Reset Request 🔐</h2>
//                 <p style="color: #555;">Namaste <strong>${name}</strong>,</p>
//                 <p style="color: #555;">Password reset karne ke liye neeche button click karo:</p>
//                 <a href="${resetURL}"
//                     style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
//                     🔑 Password Reset karo
//                 </a>
//                 <p style="color: #999; font-size: 13px;">Yeh link 15 minute mein expire ho jaayega.</p>
//                 <p style="color: #999; font-size: 13px;">Agar tumne request nahi ki toh is email ko ignore karo.</p>
//             </div>
//         `
//     }

//     await transporter.sendMail(mailOptions)
// }
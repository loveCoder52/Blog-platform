// ─────────────────────────────────────────
// FIXED: Frontend validation utilities
// ─────────────────────────────────────────

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export const validatePassword = (password) => {
    return password.length >= 8
}

export const validateUsername = (username) => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username)
}

export const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-teal-500']
    
    return {
        score: Math.min(strength, 6),
        label: levels[strength] || 'Very Weak',
        color: colors[strength] || 'bg-red-500'
    }
}

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return ''
    return input
        .trim()
        .substring(0, 1000)  // Limit length
        .replace(/[<>]/g, '')  // Remove HTML tags
}

export const validateBlogInput = (title, content) => {
    const errors = []
    
    if (!title || title.trim().length === 0) {
        errors.push("Title is required")
    } else if (title.length > 100) {
        errors.push("Title must be less than 100 characters")
    }
    
    if (!content || content.trim().length === 0) {
        errors.push("Content is required")
    } else if (content.length > 50000) {
        errors.push("Content must be less than 50000 characters")
    }
    
    return errors
}

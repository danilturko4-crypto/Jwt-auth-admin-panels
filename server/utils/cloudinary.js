const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLAUDINARY_CLOUD_NAME,
    api_key: process.env.CLAUDINARY_API_KEY,
    api_secret: process.env.CLAUDINARY_API_SECRET,
})

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'fighters', resource_type: 'image' },
            (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
            }
        )
        stream.end(buffer)
    })
}

const deleteFromCloudinary = (photoUrl) => {
    if (!photoUrl) return Promise.resolve()
    const parts = photoUrl.split('/')
    const filename = parts[parts.length - 1].split('.')[0]
    const publicId = `fighters/${filename}`
    return cloudinary.uploader.destroy(publicId)
}

module.exports = { uploadToCloudinary, deleteFromCloudinary }

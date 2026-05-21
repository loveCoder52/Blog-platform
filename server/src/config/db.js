import mongoose from 'mongoose';

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI,{
            dbName: process.env.DB_NAME
        })
        console.log("database connected successfully", mongoose.connection.host);
        console.log("database name: ", mongoose.connection.name);
    } catch (error) {
        console.log("database connections error", error);
        process.exit(1);
    }
}

export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Event listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ Erro de conexão MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado");
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;

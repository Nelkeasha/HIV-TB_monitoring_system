import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { testFhirConnection } from './services/fhir.service';

const PORT = process.env.PORT || 3000;

const start = async () => {
    await connectDB();
    await testFhirConnection();
    app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
};


start();
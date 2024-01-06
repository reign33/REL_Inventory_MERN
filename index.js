import app from "./app.js"
import config from "./utils/config.js";


const PORT = config.PORT || 3001;

app.listen(PORT, () => {
    console.log(`The Server is now running on PORT ${PORT}`);
});
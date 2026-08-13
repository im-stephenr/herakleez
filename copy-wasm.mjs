import { cpSync, mkdirSync } from "fs";

mkdirSync("./public", { recursive: true });
cpSync("./node_modules/sql.js/dist/sql-wasm.wasm", "./public/sql-wasm.wasm");
console.log("✅ sql-wasm.wasm copied to public/");

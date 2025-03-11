import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
	let port = 4000; // 기본 포트

	// 모드에 따른 포트 설정
	if (mode === "staging") {
		port = 5000;
	} else if (mode === "production") {
		port = 6000;
	}

	return {
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		server: {
			open: true,
			host: "0.0.0.0",
			port: port, // 설정된 포트를 사용
			headers: {
				"Service-Worker-Allowed": "/",
			},
		},
	};
});

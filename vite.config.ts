import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import svgLoader from "vite-svg-loader"
import UnoCSS from "unocss/vite"
import AutoImport from "unplugin-auto-import/vite"
import SvgComponent from "unplugin-svg-component/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 获取环境变量
  const env = loadEnv(mode, process.cwd());
  console.log(env)
  return {
    baseUrl: '/',
    resolve: {
      alias: {
        // @ 符号指向 src 目录
        "@": resolve(__dirname, "src"),
      }
    },
    // 运行后本地预览的服务器
    server: {
      // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
      host: true,
      // 开发环境预览服务器端口
      port: 8080,
      // 启动后是否自动打开浏览器
      open: false,
      // 是否开启CORS跨域
      cors: true,
      // 预热常用文件，提高初始页面加载速度
      warmup: {
        clientFiles: [
          "./src/layouts/**/*.*",
          "./src/store/**/*.*",
          "./src/router/**/*.*"
        ]
      }
    },
    // 构建配置
    build: {
      // 自定义底层的 Rollup 打包配置
      rollupOptions: {
        output: {
          /**
           * @name 分块策略
           * @description 1. 注意这些包名必须存在，否则打包会报错
           * @description 2. 如果你不想自定义 chunk 分割策略，可以直接移除这段配置
           */
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
            element: ["element-plus", "@element-plus/icons-vue"],
            vxe: ["vxe-table"]
          }
        }
      },
      // 是否开启 gzip 压缩大小报告，禁用时能略微提高构建性能
      reportCompressedSize: false,
      // 单个 chunk 文件的大小超过 2048kB 时发出警告
      chunkSizeWarningLimit: 2048
    },
    // 混淆器
    esbuild:{
      // 打包构建时移除 console.log
      pure: ["console.log"],
      // 打包构建时移除 debugger
      drop: ["debugger"],
      // 打包构建时移除所有注释
      legalComments: "none"
    },
    // 依赖预构建
    optimizeDeps: {
      include: ["element-plus/es/components/*/style/css"]
    },
    // CSS 相关配置
    css: {
      // 线程中运行 CSS 预处理器
      preprocessorMaxWorkers: true
    },
    // 插件配置
    plugins: [
      vue(),
      // 支持将 SVG 文件导入为 Vue 组件
      svgLoader({
        defaultImport: "url",
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  // @see https://github.com/svg/svgo/issues/1128
                  removeViewBox: false
                }
              }
            }
          ]
        }
      }),
      // 自动生成 SvgIcon 组件和 SVG 雪碧图
      SvgComponent({
        iconDir: [resolve(__dirname, "src/assets/icons")],
        preserveColor: resolve(__dirname, "src/assets/icons/preserve-color"),
        dts: true,
        dtsDir: resolve(__dirname, "types/auto")
      }),
      // 原子化 CSS
      UnoCSS(),
      // 自动按需导入 API
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: "types/auto/auto-imports.d.ts",
        resolvers: [ElementPlusResolver()]
      }),
      // 自动按需导入组件
      Components({
        dts: "types/auto/components.d.ts",
        resolvers: [ElementPlusResolver()]
      }),
    ]
  }
})

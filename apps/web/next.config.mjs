/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  webpack: (config) => {
    // Handle module resolution
    config.resolve.extensions = [".ts", ".tsx", ".js", ".jsx", ...config.resolve.extensions]
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    }
    return config
  }
}

export default nextConfig

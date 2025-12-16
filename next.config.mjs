const nextConfig = {
  compiler: {
    styledComponents: true
  },
  experimental: {
    serverComponentsExternalPackages: ['llamaindex', 'onnxruntime-node']
  }
};

export default nextConfig;

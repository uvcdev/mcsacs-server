type CorsConfig = {
  origin?: Array<string> | string;
  methods?: Array<string>;
  credentials?: boolean;
};

const corsConfig: CorsConfig = {
  origin: ['http://localhost:8000'],
  // origin: '*',
  methods: ['OPTIONS', 'GET', 'POST', 'HEAD', 'PUT', 'DELETE'],
  credentials: true,
};

export default corsConfig;

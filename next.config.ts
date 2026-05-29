import type { NextConfig } from "next"; 
import { withBotId } from 'botid/next/config';

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      // Router Cache cliente: segmentos dinámicos re-usables 30s al hacer back/forward
      // o re-entrar al mismo path. No afecta la primera visita ni acciones que
      // llaman revalidatePath.
      dynamic: 30,
      static: 180,
    },
  },
};

export default withBotId(nextConfig);

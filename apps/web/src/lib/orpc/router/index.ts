import { protectedProcedure, publicProcedure } from '@/lib/orpc';
import { getCommodityTypes } from '@/routes/admin/commodity/-app/get-commodity-types';
import { getLandTypes } from '@/routes/admin/land/-app/get-land-types';
import { getProductBrands } from '@/routes/admin/product/product-brand/-app/get-product-brands';
import { getProductTypes } from '@/routes/admin/product/-app/get-product-types';
import { createProvince } from '@/routes/admin/region/province/-app/create-province';
import { deleteProvince } from '@/routes/admin/region/province/-app/delete-province';
import { getProvinces } from '@/routes/admin/region/province/-app/get-provinces';
import { updateProvince } from '@/routes/admin/region/province/-app/update-province';
import { createRegency } from '@/routes/admin/region/regency/-app/create-regency';
import { deleteRegency } from '@/routes/admin/region/regency/-app/delete-regency';
import { getRegencies } from '@/routes/admin/region/regency/-app/get-regencies';
import { updateRegency } from '@/routes/admin/region/regency/-app/update-regency';
import { getSession } from '@/routes/auth/-app/get-session';
import { createTodo } from '@/routes/todos/-app/create-todo';
import { deleteTodo } from '@/routes/todos/-app/delete-todo';
import { getTodos } from '@/routes/todos/-app/get-todos';
import { toggleTodo } from '@/routes/todos/-app/toggle-todo';
import { createLandType } from '@/routes/admin/land/-app/create-land-type';
import { updateLandType } from '@/routes/admin/land/-app/update-land-type';
import { deleteLandType } from '@/routes/admin/land/-app/delete-land-type';
/**
 * Main oRPC Router
 *
 * This router provides a unified API interface for the entire application,
 * following Clean Architecture principles with feature-based organization.
 *
 * **Architecture Benefits:**
 * - **Unified Data Layer**: All API calls go through oRPC for consistency
 * - **Type Safety**: End-to-end TypeScript inference from server to client
 * - **Feature Organization**: Endpoints grouped by business domain (auth, todos, etc.)
 * - **Clean Architecture**: Domain logic separated in feature modules (_api folders)
 *
 * **Better Auth Integration:**
 * - Auth endpoints follow Better Auth conventions and terminology
 * - Session management integrated with Better Auth context
 * - Compatible with existing Better Auth patterns and middleware
 */
export default {
  /**
   * Health check endpoint for monitoring
   */
  healthCheck: publicProcedure.handler(() => {
    return 'OK';
  }),

  /**
   * Authentication endpoints following Better Auth conventions
   */
  auth: {
    getSession,
  },

  /**
   * Protected data endpoint demonstrating auth-required functionality
   */
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    };
  }),

  /**
   * Todo feature endpoints organized by domain
   */
  todo: {
    getAll: getTodos,
    create: createTodo,
    toggle: toggleTodo,
    delete: deleteTodo,
  },

  /**
   * Map data feature endpoints
   */
  map: {
  },

  admin: {
    region: {
      province: {
        get: getProvinces,
        create: createProvince,
        update: updateProvince,
        delete: deleteProvince,
      },
      regency: {
        get: getRegencies,
        create: createRegency,
        update: updateRegency,
        delete: deleteRegency,
      },
    },
    land: {
      land_type: {
        get: getLandTypes,
        create: createLandType,
        update: updateLandType,
        delete: deleteLandType,
      },
    },
    commodity: {
      commodity_type: {
        get: getCommodityTypes,
      },
    },
    product: {
      product_type: {
        get: getProductTypes,
      },
      product_brand: {
        get: getProductBrands,
      },
    }
  }
};

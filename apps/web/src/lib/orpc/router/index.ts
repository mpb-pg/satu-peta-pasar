import { protectedProcedure, publicProcedure } from '@/lib/orpc';
import { createCommodityType } from '@/routes/admin/commodity/-app/create-commodity-type';
import { deleteCommodityType } from '@/routes/admin/commodity/-app/delete-commodity-type';
import { getCommodityTypes } from '@/routes/admin/commodity/-app/get-commodity-types';
import { updateCommodityType } from '@/routes/admin/commodity/-app/update-commodity-type';
import { getProvinceCommodities } from '@/routes/admin/commodity/province-commodity/-app/get-province-commodities';
import { createLandType } from '@/routes/admin/land/-app/create-land-type';
import { deleteLandType } from '@/routes/admin/land/-app/delete-land-type';
import { getLandTypes } from '@/routes/admin/land/-app/get-land-types';
import { updateLandType } from '@/routes/admin/land/-app/update-land-type';
import { createProvinceLand } from '@/routes/admin/land/province-land/-app/create-province-land';
import { deleteProvinceLand } from '@/routes/admin/land/province-land/-app/delete-province-land';
import { getProvinceLands } from '@/routes/admin/land/province-land/-app/get-province-lands';
import { updateProvinceLand } from '@/routes/admin/land/province-land/-app/update-province-land';
import { getProvincePotentials } from '@/routes/admin/potential/province_potential/-app/get-province-potentials';
import { getProductTypes } from '@/routes/admin/product/-app/get-product-types';
import { getProductBrands } from '@/routes/admin/product/product-brand/-app/get-product-brands';
import { createProvince } from '@/routes/admin/region/province/-app/create-province';
import { deleteProvince } from '@/routes/admin/region/province/-app/delete-province';
import { getProvinces } from '@/routes/admin/region/province/-app/get-provinces';
import { updateProvince } from '@/routes/admin/region/province/-app/update-province';
import { createRegency } from '@/routes/admin/region/regency/-app/create-regency';
import { deleteRegency } from '@/routes/admin/region/regency/-app/delete-regency';
import { getRegencies } from '@/routes/admin/region/regency/-app/get-regencies';
import { updateRegency } from '@/routes/admin/region/regency/-app/update-regency';
import { getStallProductBrand } from '@/routes/admin/stall/-app/get-stall-product-brand';
import { getStalls } from '@/routes/admin/stall/-app/get-stalls';
import { deleteUser } from '@/routes/admin/user/-app/delete-user';
import { getUserById } from '@/routes/admin/user/-app/get-user-by-id';
import { getUsers } from '@/routes/admin/user/-app/get-users';
import { updateUser } from '@/routes/admin/user/-app/update-user';
import { getSession } from '@/routes/auth/-app/get-session';
import { createTodo } from '@/routes/todos/-app/create-todo';
import { deleteTodo } from '@/routes/todos/-app/delete-todo';
import { getTodos } from '@/routes/todos/-app/get-todos';
import { toggleTodo } from '@/routes/todos/-app/toggle-todo';
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
  map: {},

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
      province_land: {
        get: getProvinceLands,
        create: createProvinceLand,
        update: updateProvinceLand,
        delete: deleteProvinceLand,
      },
      regency_land: {
        // get: getRegencyLands,
        // create: createRegencyLand,
        // update: updateRegencyLand,
        // delete: deleteRegencyLand,
      },
    },
    commodity: {
      commodity_type: {
        get: getCommodityTypes,
        create: createCommodityType,
        update: updateCommodityType,
        delete: deleteCommodityType,
      },
      province_commodity: {
        get: getProvinceCommodities,
        // createProvinceCommodity,
        // updateProvinceCommodity,
        // deleteProvinceCommodity,
      },
      regency_commodity: {
        // getRegencyCommodities,
        // createRegencyCommodity,
        // updateRegencyCommodity,
        // deleteRegencyCommodity,
      },
    },
    product: {
      product_type: {
        get: getProductTypes,
      },
      product_brand: {
        get: getProductBrands,
      },
    },

    potential: {
      province_potential: {
        get: getProvincePotentials,
        // createProvincePotential,
        // updateProvincePotential,
        // deleteProvincePotential,
      },
      regency_potential: {
        // getRegencyPotentials,
        // createRegencyPotential,
        // updateRegencyPotential,
        // deleteRegencyPotential,
      },
    },

    sale: {
      // sale_overview: {},
      // sales_realization: {}
    },

    stall: {
      get: getStalls,
      getStallProduct: getStallProductBrand,
    },

    user: {
      get: getUsers,
      getById: getUserById,
      update: updateUser,
      delete: deleteUser,
    },
  },
};

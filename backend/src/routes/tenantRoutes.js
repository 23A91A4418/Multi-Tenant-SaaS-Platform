const express = require('express');
const router = express.Router();

const { getTenantDetails,
    updateTenant, 
    listAllTenants,
    
} = require('../controllers/tenantController');
const authMiddleware = require('../middleware/authMiddleware');
const { addUserToTenant,
    listTenantUsers,
 } = require('../controllers/userController');
router.get('/:tenantId', authMiddleware, getTenantDetails);
router.put('/:tenantId', authMiddleware, updateTenant);
router.get('/', authMiddleware, listAllTenants);
router.post('/:tenantId/users', authMiddleware, addUserToTenant);
router.get('/:tenantId/users', authMiddleware, listTenantUsers);
module.exports = router;

// Define the association between User and Address
import Address from "./address";
import User from "./user";

//Relationship between User and Address
User.hasMany(Address, {foreignKey: 'user_id'});
Address.belongsTo(User, {foreignKey: 'user_id'});

export default {User, Address};
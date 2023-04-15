import sequelize from "../config/database";
import {DataTypes, Model} from "sequelize";

class User extends Model {
    public id!: number;
    public displayName?: string;
    public username?: string;
    public contactNumber?: string;
    public email?: string;
    public dateOfBirth?: Date;
    public photoKey?: string;
    public password?: string;
    public refreshToken?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        display_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'display_name'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'contact_number'
        },
        is_contact_number_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'date_of_birth'
        },
        photoKey: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'photo_key'
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'refresh_token',
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'users',
        underscored: true,
        scopes: {
            exclude_password: {
                attributes: {
                    exclude: ['password']
                }
            }
        }
    },
);


export default User;
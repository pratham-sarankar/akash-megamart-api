import sequelize from "../../config/database";
import {DataTypes, Model} from "sequelize";

class User extends Model {
    public id!: number;
    public displayName?: string;
    public username?: string;
    public contactNumber?: string;
    public isContactNumberVerified?: boolean;
    public email?: string;
    public isEmailVerified?: boolean;
    public dateOfBirth?: Date;
    public photoKey?: string;
    public password?: string;
    public refreshToken?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        displayName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'display_name'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                name: 'username',
                msg: 'Username already exists.'
            },
            field: 'username'
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                name: 'contact_number',
                msg: 'Contact number already exists.'
            },
            field: 'contact_number'
        },
        isContactNumberVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_contact_number_verified'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: {
                name: 'email',
                msg: 'Email already exists.'
            },
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_email_verified',
        },
        dateOfBirth: {
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
            field: 'password'
        }
    },
    {
        sequelize,
        tableName: 'users',
        underscored: true,
        scopes: {
            public: {
                attributes: {
                    exclude: ['password', 'refreshToken']
                }
            }
        }
    },
);


export default User;
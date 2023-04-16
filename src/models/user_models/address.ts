import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/database';

class Address extends Model {
    public id!: number;
    public addressLine1!: string;
    public addressLine2!: string | null;
    public floor!: number;
    public contactNumber!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Address.init(
    {
        line1: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'line_1',
        },
        line2: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'line_2',
        },
        floor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'floor',
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'contact_number',
        },
    },
    {
        sequelize,
        tableName: 'addresses',
        underscored: true,
    },
);


export default Address;

export default class ValidationController {

    static async validateEmail(email: string) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            throw new Error("Email address is required.");
        }

        if (email.length > 255) {
            throw new Error("Email address is too long.");
        }

        if (!emailRegex.test(email)) {
            throw new Error("Invalid email address format.");
        }

        return true;
    }

    static async validatePincode(pincode: string) {
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode)) {
            throw new Error('Invalid pincode');
        }
    }

    static async validateContactNumber(contactNumber: string) {
        // Matches a phone number that starts with a '+' sign, followed by a 1-3 digit country code, and then a 10-digit phone number.
        const contactNumberRegex = /^\+(?:[0-9]{1,3})?[0-9]{10}$/;
        const isValid = contactNumberRegex.test(contactNumber);
        if (!isValid) {
            if (!/^\+/.test(contactNumber)) {
                throw new Error("Contact number must start with '+' sign.");
            } else if (!/^\+(?:[0-9]{1,3})?[0-9]{10}$/.test(contactNumber)) {
                throw new Error("Invalid contact number format");
            }
        }
        return true;
    }

    static async validatePassword(password: string) {
        if (!password) {
            throw new Error("Password is required.");
        }

        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long.");
        }

        if (password.length > 255) {
            throw new Error("Password is too long.");
        }

        //Must contain at least one uppercase letter
        if (!/^(?=.*[A-Z])[A-Za-z\d@$!%*?&]+$/.test(password)) {
            throw new Error("At least 1 uppercase letter is required.");
        }

        //Must contain at least one special character
        if (!/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(password)) {
            throw new Error("At least 1 special character is required.");
        }

        return true;
    }

    static async validateDate(date: string) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const isValidFormat = dateRegex.test(date);
        if (!isValidFormat) {
            throw new Error("Invalid date format.");
        }
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const isValidDate = (
            year.toString() === date.substring(0, 4) &&
            month.toString().padStart(2, '0') === date.substring(5, 7) &&
            day.toString().padStart(2, '0') === date.substring(8, 10)
        );
        if (!isValidDate) {
            throw new Error("Invalid date value.");
        }
        return true;
    }

}
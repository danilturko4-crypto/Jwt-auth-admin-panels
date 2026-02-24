module.exports = class UserDto {
    email;
    id;
    role;
    assignedTatami;
    
    constructor(model) {
        this.email = model.email
        this.id = model._id  // ← ВАЖНО: должен быть _id из MongoDB
        this.role = model.role
        this.assignedTatami = model.assignedTatami
    }
}
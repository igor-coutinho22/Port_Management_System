class ComplementaryTaskCategoryDTO {
    constructor(id, code, name, description, defaultDuration, expectedImpact) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.defaultDuration = defaultDuration;
        this.expectedImpact = expectedImpact; // 'Parallel' or 'Suspension'
    }
}

module.exports = ComplementaryTaskCategoryDTO;
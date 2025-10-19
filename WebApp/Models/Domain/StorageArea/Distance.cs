namespace WebApp.Models.Domain.StorageArea
{
    public class Distance
    {
        protected Distance()
        {
        }

        public Distance(StorageArea fromStorageArea, StorageArea toStorageArea, double value, string unit)
        {
            FromStorageArea = fromStorageArea ?? throw new ArgumentNullException(nameof(fromStorageArea));
            ToStorageArea = toStorageArea ?? throw new ArgumentNullException(nameof(toStorageArea));

            if (value < 0)
                throw new ArgumentOutOfRangeException(nameof(value), "Distance value must be >= 0.");

            Value = value;
            Unit = unit ?? throw new ArgumentNullException(nameof(unit));
        }

        public int Id { get; set; }
        
        // Relationship to the 'from' area
        public int FromStorageAreaId { get; set; }
        public virtual StorageArea FromStorageArea { get; set; } = null!;

        // Relationship to the 'to' area
        public int ToStorageAreaId { get; set; }
        public virtual StorageArea ToStorageArea { get; set; } = null!;

        // The value used for optimization (e.g., travel time in minutes or distance in meters)
        public double Value { get; set; }
        public string Unit { get; set; } = null!; // e.g., "minutes", "meters"
    }
}
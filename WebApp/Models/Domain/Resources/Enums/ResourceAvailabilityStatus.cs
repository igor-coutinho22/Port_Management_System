namespace WebApp.Models.Domain.Resources.Enums
{
    public enum ResourceAvailabilityStatus
    {
        Active,
        Inactive,
        UnderMaintenance
    }

    public static class ResourceAvailabilityStatusExtensions
    {
        public static string GetDisplayName(this ResourceAvailabilityStatus status) => status switch
        {
            ResourceAvailabilityStatus.Active => "Active",
            ResourceAvailabilityStatus.Inactive => "Inactive",
            ResourceAvailabilityStatus.UnderMaintenance => "Under Maintenance",
            _ => status.ToString()
        };
    }
}

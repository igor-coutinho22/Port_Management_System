using System;
using System.Collections.Generic;

namespace WebApp.Models.Application.DTOs
{
    public record ContainerYardDto(
        string Name,
        int MaxCapacityTeu,
        int CurrentOccupancyTeu,
        List<Guid> DockIds
    );
}

using System;
using System.Collections.Generic;
using PortManagement.Domain.Enums;

namespace WebApp.Models.Application.DTOs
{
    public class ContainerYardDto
    {
        public StorageAreaDTO? StorageArea { get; set; }
        public List<Guid>? DockIds { get; set; }
    }
}

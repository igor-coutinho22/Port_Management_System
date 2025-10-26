using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Context;
using FluentAssertions;
using Xunit;
using System;

public class StorageAreaTests
{
    [Fact]
    public void ContainerYard_ShouldInitializeAllProperties()
    {
        var yard = new ContainerYard
        {
            Id = 1,
            Name = "Main Yard",
            MaxCapacityTeu = 500,
            CurrentOccupancyTeu = 200
        };

        yard.Id.Should().Be(1);
        yard.Name.Should().Be("Main Yard");
        yard.MaxCapacityTeu.Should().Be(500);
        yard.CurrentOccupancyTeu.Should().Be(200);
        yard.DocksServed.Should().BeEmpty();
    }

    [Fact]
    public void ContainerYard_ShouldAllowCapacityChange()
    {
        var yard = new ContainerYard { Id = 2, Name = "Adjustable Yard", MaxCapacityTeu = 300 };
        yard.ChangeMaxCapacity(400);

        yard.MaxCapacityTeu.Should().Be(400);
    }

    [Fact]
    public void ContainerYard_ShouldThrow_WhenNegativeCapacity()
    {
        var yard = new ContainerYard { Id = 3, Name = "Invalid Yard", MaxCapacityTeu = 200 };
        var act = () => yard.ChangeMaxCapacity(-10);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*negative*");
    }

    [Fact]
    public void ContainerYard_ShouldUpdateOccupancy()
    {
        var yard = new ContainerYard { Id = 4, Name = "Occupancy Yard", MaxCapacityTeu = 500 };
        yard.UpdateCurrentOccupancy(150);

        yard.CurrentOccupancyTeu.Should().Be(150);
    }

    [Fact]
    public void ContainerYard_ShouldThrow_WhenOccupancyExceedsCapacity()
    {
        var yard = new ContainerYard { Id = 5, Name = "Overflow Yard", MaxCapacityTeu = 100 };
        var act = () => yard.UpdateCurrentOccupancy(150);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*exceeds maximum capacity*");
    }

    [Fact]
    public void Warehouse_ShouldInitializeAllProperties()
    {
        var warehouse = new Warehouse
        {
            Id = 6,
            Name = "Warehouse A",
            MaxCapacityTeu = 1000,
            CurrentOccupancyTeu = 400,
            SpecializedCargoType = "General"
        };

        warehouse.Id.Should().Be(6);
        warehouse.Name.Should().Be("Warehouse A");
        warehouse.MaxCapacityTeu.Should().Be(1000);
        warehouse.CurrentOccupancyTeu.Should().Be(400);
        warehouse.SpecializedCargoType.Should().Be("General");
    }

    [Fact]
    public void Warehouse_ShouldAllowUpdatingCargoType()
    {
        var warehouse = new Warehouse
        {
            Id = 7,
            Name = "Warehouse B",
            MaxCapacityTeu = 800,
            SpecializedCargoType = "General"
        };

        warehouse.UpdateCargoType("Hazardous");

        warehouse.SpecializedCargoType.Should().Be("Hazardous");
    }

    [Fact]
    public void Warehouse_ShouldAllowCapacityAndOccupancyUpdate()
    {
        var warehouse = new Warehouse
        {
            Id = 8,
            Name = "Warehouse C",
            MaxCapacityTeu = 600,
            CurrentOccupancyTeu = 200
        };

        warehouse.ChangeMaxCapacity(700);
        warehouse.UpdateCurrentOccupancy(300);

        warehouse.MaxCapacityTeu.Should().Be(700);
        warehouse.CurrentOccupancyTeu.Should().Be(300);
    }

    [Fact]
    public void Warehouse_ShouldThrow_WhenOccupancyExceedsCapacity()
    {
        var warehouse = new Warehouse
        {
            Id = 9,
            Name = "Small Warehouse",
            MaxCapacityTeu = 100
        };

        var act = () => warehouse.UpdateCurrentOccupancy(200);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*exceeds maximum capacity*");
    }
}

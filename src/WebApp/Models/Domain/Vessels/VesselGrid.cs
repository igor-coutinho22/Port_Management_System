using System.Text.Json.Serialization;
using WebApp.Models.Domain.Containers;

public class VesselGrid
{
    [JsonInclude]
    public Container?[] Grid { get; private set; } = Array.Empty<Container?>();

    public int Bays { get; private set; }
    public int Rows { get; private set; }
    public int Tiers { get; private set; }

    public VesselGrid() { } // for serializers/EF if needed

    [JsonConstructor]
    public VesselGrid(int bays, int rows, int tiers, Container?[]? grid = null)
    {
        Bays = bays;
        Rows = rows;
        Tiers = tiers;

        Grid = grid ?? new Container?[bays * rows * tiers];

        if (Grid.Length != bays * rows * tiers)
            throw new ArgumentException("Grid length must equal bays*rows*tiers");
    }

    private int Index(int b, int r, int t) => b * (Rows * Tiers) + r * Tiers + t;

    public Container? Get(int b, int r, int t)
    {
        if (b < 0 || r < 0 || t < 0) throw new IndexOutOfRangeException();
        return Grid[Index(b, r, t)];
    }

    public void Set(int b, int r, int t, Container c) => Grid[Index(b, r, t)] = c;
}

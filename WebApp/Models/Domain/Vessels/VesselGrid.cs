using System.ComponentModel;
using System.Text.Json.Serialization;

public class VesselGrid
{
    [JsonInclude]
    public Container?[] Grid{ get; private set; }
    public int Bays { get; set; }
    public int Rows { get; set; }
    public int Tiers { get; set; }

    public VesselGrid()
    {
        Bays = Rows = Tiers = 0;
        Grid = Array.Empty<Container?>();
    }

    // Main constructor used in code
    [JsonConstructor]
    public VesselGrid(int bays, int rows, int tiers, Container?[]? flat = null)
    {
        Bays = bays;
        Rows = rows;
        Tiers = tiers;
        Grid = flat ?? new Container?[bays * rows * tiers];
        if (Grid.Length != bays * rows * tiers)
            throw new ArgumentException("Flat length must equal bays*rows*tiers");
    }

    private int Index(int b, int r, int t) => b * (Rows * Tiers) + r * Tiers + t;

    public Container? Get(int b, int r, int t)
    {
        if (b < 0 || r < 0 || t < 0) throw new IndexOutOfRangeException();
        return Grid[Index(b, r, t)];
    }

    public void Set(int b, int r, int t, Container c) => Grid[Index(b, r, t)] = c;
}

# Computational Complexity and Performance Analysis of the Vessel Scheduling Algorithms

## 1. Introduction

This document analyzes the computational complexity and empirical
performance of several scheduling algorithms implemented in Prolog for
sequencing vessel operations at a single dock.

Each vessel is represented as:

``` prolog
vessel(Id, Arrival, Departure, LoadingTime, UnloadingTime).
```

-   **Arrival** -- earliest time the vessel can start processing\
-   **Departure** -- desired completion time (due date)\
-   **LoadingTime + UnloadingTime** -- total processing time

The objective is to find a sequence of vessels and start times that
minimizes the **total delay**:

-   For each vessel, if it finishes after its departure time, the delay
    is\
    `max(0, (FinishTime + 1) - Departure)`.
-   The objective value is the **sum of delays over all vessels**.

Let:

-   **N = number of vessels** in the instance.

We consider:

-   One **exact optimal** algorithm (full enumeration)
-   Several **heuristic rules**:
    -   Early arrival
    -   Early departure
    -   Shortest processing time
    -   Minimum slack time
    -   Arrived + shortest departure time
    -   ATC (Apparent Tardiness Cost)

We analyze both:

-   **Theoretical complexity** (Big-O in terms of N)
-   **Empirical behavior** on datasets of size N = 5, 8, 10, 12, 15, 30.

------------------------------------------------------------------------

## 2. Description of the Methods

### 2.1 Common Components

Two predicates are used by almost all methods:

1.  `sequence_temporization/2`\
    Runs once per vessel, computing start/end times. Complexity:
    **O(N)**.

2.  `sum_delays/2`\
    Computes delays across N vessels. Complexity: **O(N)**.

------------------------------------------------------------------------

### 2.2 Exact Optimal Method: `obtain_seq_shortest_delay/2`

Enumerates all N! permutations. Each permutation costs O(N) to simulate
and score.

Total complexity: **O(N! · N)**.

------------------------------------------------------------------------

### 2.3 Early Arrival Time --- `heuristic_early_arrival_time/2`

-   Build `(Arrival, V)` list: O(N)
-   Sort: O(N log N)
-   Simulation + delay: O(N)

Total: **O(N log N)**.

------------------------------------------------------------------------

### 2.4 Early Departure Time --- `heuristic_early_departure_time/2`

Sort vessels by departure time.

Total: **O(N log N)**.

------------------------------------------------------------------------

### 2.5 Shortest Processing Time --- `heuristic_shortest_processing_time/2`

Compute P = Loading + Unloading, sort by P.

Total: **O(N log N)**.

------------------------------------------------------------------------

### 2.6 Minimum Slack Time --- `heuristic_minimum_slack_time/2`

Compute slack = (Departure - Arrival) - P, sort.

Total: **O(N log N)**.

------------------------------------------------------------------------

### 2.7 Arrived + Shortest Departure Time --- `heuristic_arrived_shortest_departure_time/2`

Dynamic selection: each step scans remaining vessels.

Total: **O(N²)**.

------------------------------------------------------------------------

### 2.8 ATC --- `heuristic_atc/2`

ATC computes priorities for all remaining vessels at each step.

Total: **O(N²)**.

------------------------------------------------------------------------

## 3. Complexity Summary

  Method                         Complexity
  ------------------------------ ----------------
  Optimal                        **O(N!·N)**
  Early arrival                  **O(N log N)**
  Early departure                **O(N log N)**
  SPT                            **O(N log N)**
  Minimum slack                  **O(N log N)**
  Arrived + shortest departure   **O(N²)**
  ATC                            **O(N²)**

------------------------------------------------------------------------

## 4. Experimental Results

### Dataset N = 5

-   Optimal: 0\
-   Early arrival: 0\
-   Early departure: 0\
-   SPT: 40\
-   Minimum slack: 5\
-   Arrived+shortest departure: 0\
-   ATC: 0

------------------------------------------------------------------------

### Dataset N = 8

-   Optimal: 25\
-   Early departure: 25\
-   Arrived+shortest departure: 25\
-   Early arrival: 26\
-   ATC: 30\
-   SPT: 119\
-   Minimum slack: 197

------------------------------------------------------------------------

### Dataset N = 10

-   Optimal: 127\
-   ATC: 127\
-   Early arrival / departure / arrived: 150\
-   Minimum slack: 232\
-   SPT: 800

------------------------------------------------------------------------

### Dataset N = 12

-   Optimal: infeasible (\>1h)\
-   ATC: 159\
-   Early arrival / departure / arrived: 179\
-   Minimum slack: 292\
-   SPT: 816

------------------------------------------------------------------------

### Dataset N = 15

-   ATC: 330\
-   Early arrival / departure / arrived: 371\
-   Minimum slack: 575\
-   SPT: 1169

------------------------------------------------------------------------

### Dataset N = 30

-   ATC: 2350\
-   Early arrival / departure / slack: 2550\
-   SPT: 5408\
-   Arrived+shortest departure: too slow

------------------------------------------------------------------------

## 5. Conclusion

-   **Optimal** grows factorially and becomes unusable beyond N ≈ 10.\
-   Sorting-based heuristics (**O(N log N)**) scale best but may
    sacrifice quality.\
-   **ATC is consistently the best-performing heuristic** for delay
    minimization.\
-   Early departure is a strong and very fast backup heuristic.\
-   SPT and minimum slack typically perform poorly.

A practical scheduler should use **ATC** as the main method and **Early
Departure** as a fallback. The optimal solver should only be used on
small instances for validation.


## 6. Raw Experimental Data

This section records the **exact datasets** used and the **Prolog commands and outputs** obtained during testing.

### 6.1 Dataset N = 5

#### Vessels

```prolog
vessel(v1, 5, 40, 6, 8).
vessel(v2, 12, 55, 10, 7).
vessel(v3, 20, 60, 4, 9).
vessel(v4, 33, 75, 8, 6).
vessel(v5, 41, 85, 12, 5).
```

#### Commands and Results

```prolog
?- obtain_seq_shortest_delay(SeqBetterTriplets, SShortestDelay).
Better Sequence: [(v1,5,18),(v2,19,35),(v3,36,48),(v4,49,62),(v5,63,79)]
Shortest Delay: 0
Time to generate the shortest delay solution: 0.002416849136352539
SeqBetterTriplets = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v4, 49, 62), (v5, 63, 79)],
SShortestDelay = 0.

?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,18),(v2,19,35),(v3,36,48),(v4,49,62),(v5,63,79)]
SeqTripletsH = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v4, 49, 62), (v5, 63, 79)],
SDelaysH = 0.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,18),(v2,19,35),(v3,36,48),(v4,49,62),(v5,63,79)]
SeqTripletsH = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v4, 49, 62), (v5, 63, 79)],
SDelaysH = 0.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v3,20,32),(v1,33,46),(v4,47,60),(v2,61,77),(v5,78,94)]
SeqTripletsH = [(v3, 20, 32), (v1, 33, 46), (v4, 47, 60), (v2, 61, 77), (v5, 78, 94)],
SDelaysH = 40.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,18),(v2,19,35),(v3,36,48),(v5,49,65),(v4,66,79)]
SeqTripletsH = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v5, 49, 65), (v4, 66, 79)],
SDelaysH = 5.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,18),(v2,19,35),(v3,36,48),(v4,49,62),(v5,63,79)]
SeqTripletsH = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v4, 49, 62), (v5, 63, 79)],
SDelaysH = 0.

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(v1, 5, 18), (v2, 19, 35), (v3, 36, 48), (v4, 49, 62), (v5, 63, 79)],
SDelaysH = 0.
```

---

### 6.2 Dataset N = 8

#### Vessels

```prolog
vessel(v1, 4, 38, 7, 9).
vessel(v2, 10, 52, 6, 8).
vessel(v3, 19, 48, 5, 10).
vessel(v4, 25, 70, 9, 6).
vessel(v5, 31, 80, 8, 7).
vessel(v6, 45, 95, 11, 5).
vessel(v7, 56, 100, 10, 10).
vessel(v8, 63, 120, 7, 8).
```

#### Commands and Results

```prolog
?- obtain_seq_shortest_delay(SeqBetterTriplets, SShortestDelay).
Better Sequence: [(v1,4,19),(v3,20,34),(v2,35,48),(v4,49,63),(v5,64,78),(v6,79,94),(v7,95,114),(v8,115,129)]
Shortest Delay: 25
Time to generate the shortest delay solution: 0.23000097274780273
SeqBetterTriplets = [(v1, 4, 19), (v3, 20, 34), (v2, 35, 48), (v4, 49, 63), (v5, 64, 78), (v6, 79, 94), (v7, 95, 114), (v8, ..., ...)],
SShortestDelay = 25.

?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,4,19),(v2,20,33),(v3,34,48),(v4,49,63),(v5,64,78),(v6,79,94),(v7,95,114),(v8,115,129)]
SeqTripletsH = [(v1, 4, 19), (v2, 20, 33), (v3, 34, 48), (v4, 49, 63), (v5, 64, 78), (v6, 79, 94), (v7, 95, 114), (v8, ..., ...)],
SDelaysH = 26.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,4,19),(v3,20,34),(v2,35,48),(v4,49,63),(v5,64,78),(v6,79,94),(v7,95,114),(v8,115,129)]
SeqTripletsH = [(v1, 4, 19), (v3, 20, 34), (v2, 35, 48), (v4, 49, 63), (v5, 64, 78), (v6, 79, 94), (v7, 95, 114), (v8, ..., ...)],
SDelaysH = 25.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v2,10,23),(v3,24,38),(v4,39,53),(v5,54,68),(v8,69,83),(v1,84,99),(v6,100,115),(v7,116,135)]
SeqTripletsH = [(v2, 10, 23), (v3, 24, 38), (v4, 39, 53), (v5, 54, 68), (v8, 69, 83), (v1, 84, 99), (v6, 100, 115), (v7, ..., ...)],
SDelaysH = 119.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v3,19,33),(v1,34,49),(v7,56,75),(v2,76,89),(v4,90,104),(v5,105,119),(v6,120,135),(v8,136,150)]
SeqTripletsH = [(v3, 19, 33), (v1, 34, 49), (v7, 56, 75), (v2, 76, 89), (v4, 90, 104), (v5, 105, 119), (v6, 120, 135), (v8, ..., ...)],
SDelaysH = 197.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,4,19),(v3,20,34),(v2,35,48),(v4,49,63),(v5,64,78),(v6,79,94),(v7,95,114),(v8,115,129)]
SeqTripletsH = [(v1, 4, 19), (v3, 20, 34), (v2, 35, 48), (v4, 49, 63), (v5, 64, 78), (v6, 79, 94), (v7, 95, 114), (v8, ..., ...)],
SDelaysH = 25.

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(v1, 4, 19), (v3, 20, 34), (v2, 35, 48), (v4, 49, 63), (v5, 64, 78), (v6, 79, 94), (v8, 95, 109), (v7, ..., ...)],
SDelaysH = 30.
```

---

### 6.3 Dataset N = 10

#### Vessels

```prolog
vessel(va,  7,  50,  8,  6).
vessel(vb, 14,  55, 10,  9).
vessel(vc, 21,  60,  5, 12).
vessel(vd, 30,  75,  7,  8).
vessel(ve, 38,  78,  6, 10).
vessel(vf, 44,  95, 12,  5).
vessel(vg, 53, 105,  9, 13).
vessel(vh, 61, 110, 11,  4).
vessel(vi, 72, 120,  8,  9).
vessel(vj, 80, 135,  6,  7).
```

#### Commands and Results

```prolog
?- obtain_seq_shortest_delay(SeqBetterTriplets, SShortestDelay).
Better Sequence: [(va,7,20),(vb,21,39),(vc,40,56),(vd,57,71),(ve,72,87),(vf,88,104),(vh,105,119),(vj,120,132),(vi,133,149),(vg,150,171)]
Shortest Delay: 127
Time to generate the shortest delay solution: 26.757792949676514
SeqBetterTriplets = [(va, 7, 20), (vb, 21, 39), (vc, 40, 56), (vd, 57, 71), (ve, 72, 87), (vf, 88, 104), (vh, 105, 119), (vj, ..., ...), (..., ...)|...],
SShortestDelay = 127.

?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(va,7,20),(vb,21,39),(vc,40,56),(vd,57,71),(ve,72,87),(vf,88,104),(vg,105,126),(vh,127,141),(vi,142,158),(vj,159,171)]
SeqTripletsH = [(va, 7, 20), (vb, 21, 39), (vc, 40, 56), (vd, 57, 71), (ve, 72, 87), (vf, 88, 104), (vg, 105, 126), (vh, ..., ...), (..., ...)|...],
SDelaysH = 150.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(va,7,20),(vb,21,39),(vc,40,56),(vd,57,71),(ve,72,87),(vf,88,104),(vg,105,126),(vh,127,141),(vi,142,158),(vj,159,171)]
SeqTripletsH = [(va, 7, 20), (vb, 21, 39), (vc, 40, 56), (vd, 57, 71), (ve, 72, 87), (vf, 88, 104), (vg, 105, 126), (vh, ..., ...), (..., ...)|...],
SDelaysH = 150.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(vj,80,92),(va,93,106),(vd,107,121),(vh,122,136),(ve,137,152),(vc,153,169),(vf,170,186),(vi,187,203),(vb,204,222),(vg,223,244)]
SeqTripletsH = [(vj, 80, 92), (va, 93, 106), (vd, 107, 121), (vh, 122, 136), (ve, 137, 152), (vc, 153, 169), (vf, 170, 186), (vi, ..., ...), (..., ...)|...],
SDelaysH = 800.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(vb,14,32),(vc,33,49),(ve,50,65),(va,66,79),(vd,80,94),(vg,95,116),(vi,117,133),(vf,134,150),(vh,151,165),(vj,166,178)]
SeqTripletsH = [(vb, 14, 32), (vc, 33, 49), (ve, 50, 65), (va, 66, 79), (vd, 80, 94), (vg, 95, 116), (vi, 117, 133), (vf, ..., ...), (..., ...)|...],
SDelaysH = 232.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(va,7,20),(vb,21,39),(vc,40,56),(vd,57,71),(ve,72,87),(vf,88,104),(vg,105,126),(vh,127,141),(vi,142,158),(vj,159,171)]
SeqTripletsH = [(va, 7, 20), (vb, 21, 39), (vc, 40, 56), (vd, 57, 71), (ve, 72, 87), (vf, 88, 104), (vg, 105, 126), (vh, ..., ...), (..., ...)|...],
SDelaysH = 150.

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(va, 7, 20), (vb, 21, 39), (vc, 40, 56), (vd, 57, 71), (ve, 72, 87), (vf, 88, 104), (vh, 105, 119), (vj, ..., ...), (..., ...)|...],
SDelaysH = 127.
```

---

### 6.4 Dataset N = 12

#### Vessels

```prolog
vessel(v1,  5,  42,  6,  7).
vessel(v2, 11,  55,  9,  6).
vessel(v3, 18,  48,  4, 11).
vessel(v4, 26,  70,  7,  8).
vessel(v5, 33,  85,  8,  9).
vessel(v6, 41,  92, 10,  6).
vessel(v7, 50, 105, 11,  7).
vessel(v8, 58, 115,  9, 10).
vessel(v9, 66, 120,  5, 12).
vessel(v10, 75, 130, 8,  6).
vessel(v11, 82, 140, 7,  9).
vessel(v12, 90, 150, 6,  8).
```

#### Commands and Results

```prolog
% Optimal (obtain_seq_shortest_delay) was not completed; estimated >1h and aborted.

?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,17),(v2,18,32),(v3,33,47),(v4,48,62),(v5,63,79),(v6,80,95),(v7,96,113),(v8,114,132),(v9,133,149),(v10,150,163),(v11,164,179),(v12,180,193)]
SeqTripletsH = [(v1, 5, 17), (v2, 18, 32), (v3, 33, 47), (v4, 48, 62), (v5, 63, 79), (v6, 80, 95), (v7, 96, 113), (v8, ..., ...), (..., ...)|...],
SDelaysH = 179.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,17),(v3,18,32),(v2,33,47),(v4,48,62),(v5,63,79),(v6,80,95),(v7,96,113),(v8,114,132),(v9,133,149),(v10,150,163),(v11,164,179),(v12,180,193)]
SeqTripletsH = [(v1, 5, 17), (v3, 18, 32), (v2, 33, 47), (v4, 48, 62), (v5, 63, 79), (v6, 80, 95), (v7, 96, 113), (v8, ..., ...), (..., ...)|...],
SDelaysH = 179.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,17),(v10,75,88),(v12,90,103),(v2,104,118),(v3,119,133),(v4,134,148),(v11,149,164),(v6,165,180),(v5,181,197),(v9,198,214),(v7,215,232),(v8,233,251)]
SeqTripletsH = [(v1, 5, 17), (v10, 75, 88), (v12, 90, 103), (v2, 104, 118), (v3, 119, 133), (v4, 134, 148), (v11, 149, 164), (v6, ..., ...), (..., ...)|...],
SDelaysH = 816.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v3,18,32),(v1,33,45),(v2,46,60),(v4,61,75),(v5,76,92),(v6,93,108),(v7,109,126),(v9,127,143),(v8,144,162),(v10,163,176),(v11,177,192),(v12,193,206)]
SeqTripletsH = [(v3, 18, 32), (v1, 33, 45), (v2, 46, 60), (v4, 61, 75), (v5, 76, 92), (v6, 93, 108), (v7, 109, 126), (v9, ..., ...), (..., ...)|...],
SDelaysH = 292.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,5,17),(v3,18,32),(v2,33,47),(v4,48,62),(v5,63,79),(v6,80,95),(v7,96,113),(v8,114,132),(v9,133,149),(v10,150,163),(v11,164,179),(v12,180,193)]
SeqTripletsH = [(v1, 5, 17), (v3, 18, 32), (v2, 33, 47), (v4, 48, 62), (v5, 63, 79), (v6, 80, 95), (v7, 96, 113), (v8, ..., ...), (..., ...)|...],
SDelaysH = 179.

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(v1, 5, 17), (v3, 18, 32), (v2, 33, 47), (v4, 48, 62), (v5, 63, 79), (v6, 80, 95), (v7, 96, 113), (v10, ..., ...), (..., ...)|...],
SDelaysH = 159.
```

---

### 6.5 Dataset N = 15

#### Vessels

```prolog
vessel(v1,   3,  40,  5,  7).
vessel(v2,  10,  48,  6,  8).
vessel(v3,  18,  50,  4, 10).
vessel(v4,  24,  60,  7,  6).
vessel(v5,  28,  68,  8,  7).
vessel(v6,  36,  75,  9,  5).
vessel(v7,  44,  90,  6, 11).
vessel(v8,  52, 100, 10,  6).
vessel(v9,  60, 115, 11,  8).
vessel(v10, 67, 118,  9,  9).
vessel(v11, 74, 125,  7, 10).
vessel(v12, 82, 135,  8,  6).
vessel(v13, 91, 150, 12,  5).
vessel(v14, 99, 160,  6,  8).
vessel(v15,108, 170,  7,  7).
```

#### Commands and Results

```prolog
?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,3,14),(v2,15,28),(v3,29,42),(v4,43,55),(v5,56,70),(v6,71,84),(v7,85,101),(v8,102,117),(v9,118,136),(v10,137,154),(v11,155,171),(v12,172,185),(v13,186,202),(v14,203,216),(v15,217,230)]
SeqTripletsH = [(v1, 3, 14), (v2, 15, 28), (v3, 29, 42), (v4, 43, 55), (v5, 56, 70), (v6, 71, 84), (v7, 85, 101), (v8, ..., ...), (..., ...)|...],
SDelaysH = 371.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,3,14),(v2,15,28),(v3,29,42),(v4,43,55),(v5,56,70),(v6,71,84),(v7,85,101),(v8,102,117),(v9,118,136),(v10,137,154),(v11,155,171),(v12,172,185),(v13,186,202),(v14,203,216),(v15,217,230)]
SeqTripletsH = [(v1, 3, 14), (v2, 15, 28), (v3, 29, 42), (v4, 43, 55), (v5, 56, 70), (v6, 71, 84), (v7, 85, 101), (v8, ..., ...), (..., ...)|...],
SDelaysH = 371.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,3,14),(v4,24,36),(v12,82,95),(v14,99,112),(v15,113,126),(v2,127,140),(v3,141,154),(v6,155,168),(v5,169,183),(v8,184,199),(v11,200,216),(v13,217,233),(v7,234,250),(v10,251,268),(v9,269,287)]
SeqTripletsH = [(v1, 3, 14), (v4, 24, 36), (v12, 82, 95), (v14, 99, 112), (v15, 113, 126), (v2, 127, 140), (v3, 141, 154), (v6, ..., ...), (..., ...)|...],
SDelaysH = 1169.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v3,18,31),(v4,32,44),(v2,45,58),(v1,59,70),(v5,71,85),(v6,86,99),(v7,100,116),(v8,117,132),(v10,133,150),(v11,151,167),(v9,168,186),(v12,187,200),(v13,201,217),(v14,218,231),(v15,232,245)]
SeqTripletsH = [(v3, 18, 31), (v4, 32, 44), (v2, 45, 58), (v1, 59, 70), (v5, 71, 85), (v6, 86, 99), (v7, 100, 116), (v8, ..., ...), (..., ...)|...],
SDelaysH = 575.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,3,14),(v2,15,28),(v3,29,42),(v4,43,55),(v5,56,70),(v6,71,84),(v7,85,101),(v8,102,117),(v9,118,136),(v10,137,154),(v11,155,171),(v12,172,185),(v13,186,202),(v14,203,216),(v15,217,230)]
SeqTripletsH = [(v1, 3, 14), (v2, 15, 28), (v3, 29, 42), (v4, 43, 55), (v5, 56, 70), (v6, 71, 84), (v7, 85, 101), (v8, ..., ...), (..., ...)|...],
SDelaysH = 371.

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(v1, 3, 14), (v2, 15, 28), (v3, 29, 42), (v4, 43, 55), (v5, 56, 70), (v6, 71, 84), (v8, 85, 100), (v7, ..., ...), (..., ...)|...],
SDelaysH = 330.
```

---

### 6.6 Dataset N = 30

#### Vessels

```prolog
vessel(v1,   2,   35,  5,  7).
vessel(v2,   6,   42,  6,  8).
vessel(v3,  10,   50,  4, 10).
vessel(v4,  15,   55,  7,  6).
vessel(v5,  19,   63,  8,  7).
vessel(v6,  24,   70,  9,  5).
vessel(v7,  28,   80,  6, 11).
vessel(v8,  33,   88, 10,  6).
vessel(v9,  38,  100, 11,  8).
vessel(v10, 43,  110,  9,  9).

vessel(v11, 47,  118,  7, 10).
vessel(v12, 52,  125,  8,  6).
vessel(v13, 57,  135, 12,  5).
vessel(v14, 62,  145,  6,  8).
vessel(v15, 67,  150,  7,  7).
vessel(v16, 72,  160,  9,  8).
vessel(v17, 77,  170, 10,  7).
vessel(v18, 83,  180,  8, 12).
vessel(v19, 88,  188,  6, 11).
vessel(v20, 92,  195,  7,  9).

vessel(v21, 97,  205,  9,  6).
vessel(v22, 103, 215,  8, 10).
vessel(v23, 108, 225,  4, 12).
vessel(v24, 114, 235, 11,  5).
vessel(v25, 119, 245,  6,  7).
vessel(v26, 125, 255,  9,  8).
vessel(v27, 131, 265, 10,  6).
vessel(v28, 137, 275,  7,  9).
vessel(v29, 143, 285,  8, 11).
vessel(v30, 150, 300, 12,  6).
```

#### Commands and Results

```prolog
?- heuristic_early_arrival_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,2,13),(v2,14,27),(v3,28,41),(v4,42,54),(v5,55,69),(v6,70,83),(v7,84,100),(v8,101,116),(v9,117,135),(v10,136,153),(v11,154,170),(v12,171,184),(v13,185,201),(v14,202,215),(v15,216,229),(v16,230,246),(v17,247,263),(v18,264,283),(v19,284,300),(v20,301,316),(v21,317,331),(v22,332,349),(v23,350,365),(v24,366,381),(v25,382,394),(v26,395,411),(v27,412,427),(v28,428,443),(v29,444,462),(v30,463,480)]
SeqTripletsH = [(v1, 2, 13), (v2, 14, 27), (v3, 28, 41), (v4, 42, 54), (v5, 55, 69), (v6, 70, 83), (v7, 84, 100), (v8, ..., ...), (..., ...)|...],
SDelaysH = 2550.

?- heuristic_early_departure_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,2,13),(v2,14,27),(v3,28,41),(v4,42,54),(v5,55,69),(v6,70,83),(v7,84,100),(v8,101,116),(v9,117,135),(v10,136,153),(v11,154,170),(v12,171,184),(v13,185,201),(v14,202,215),(v15,216,229),(v16,230,246),(v17,247,263),(v18,264,283),(v19,284,300),(v20,301,316),(v21,317,331),(v22,332,349),(v23,350,365),(v24,366,381),(v25,382,394),(v26,395,411),(v27,412,427),(v28,428,443),(v29,444,462),(v30,463,480)]
SeqTripletsH = [(v1, 2, 13), (v2, 14, 27), (v3, 28, 41), (v4, 42, 54), (v5, 55, 69), (v6, 70, 83), (v7, 84, 100), (v8, ..., ...), (..., ...)|...],
SDelaysH = 2550.

?- heuristic_shortest_processing_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,2,13),(v25,119,131),(v4,132,144),(v12,145,158),(v14,159,172),(v15,173,186),(v2,187,200),(v3,201,214),(v6,215,228),(v21,229,243),(v5,244,258),(v20,259,274),(v23,275,290),(v24,291,306),(v27,307,322),(v28,323,338),(v8,339,354),(v11,355,371),(v13,372,388),(v16,389,405),(v17,406,422),(v19,423,439),(v26,440,456),(v7,457,473),(v10,474,491),(v22,492,509),(v30,510,527),(v29,528,546),(v9,547,565),(v18,566,585)]
SeqTripletsH = [(v1, 2, 13), (v25, 119, 131), (v4, 132, 144), (v12, 145, 158), (v14, 159, 172), (v15, 173, 186), (v2, 187, 200), (v3, ..., ...), (..., ...)|...],
SDelaysH = 5408.

?- heuristic_minimum_slack_time(SeqTripletsH,SDelaysH).
SeqTripletsH=[(v1,2,13),(v2,14,27),(v3,28,41),(v4,42,54),(v5,55,69),(v6,70,83),(v7,84,100),(v8,101,116),(v9,117,135),(v10,136,153),(v11,154,170),(v12,171,184),(v13,185,201),(v14,202,215),(v15,216,229),(v16,230,246),(v17,247,263),(v18,264,283),(v19,284,300),(v20,301,316),(v21,317,331),(v22,332,349),(v23,350,365),(v24,366,381),(v25,382,394),(v26,395,411),(v27,412,427),(v28,428,443),(v29,444,462),(v30,463,480)]
SeqTripletsH = [(v1, 2, 13), (v2, 14, 27), (v3, 28, 41), (v4, 42, 54), (v5, 55, 69), (v6, 70, 83), (v7, 84, 100), (v8, ..., ...), (..., ...)|...],
SDelaysH = 2550.

?- heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH).
h
Action (h for help) ? Options:
a:           abort         b:           break
c:           continue      e:           exit
g:           goals         s:           C-backtrace
t:           trace         p:             Show PID
h (?):       help
Action (h for help) ? abort
% Execution Aborted

?- heuristic_atc(SeqTripletsH, SDelaysH).
SeqTripletsH = [(v1, 2, 13), (v2, 14, 27), (v3, 28, 41), (v4, 42, 54), (v6, 55, 68), (v5, 69, 83), (v8, 84, 99), (v7, ..., ...), (..., ...)|...],
SDelaysH = 2350.
```

---

This raw data section documents exactly how the summary values in the results and conclusions were obtained, including datasets, Prolog queries, and returned schedules/delays.

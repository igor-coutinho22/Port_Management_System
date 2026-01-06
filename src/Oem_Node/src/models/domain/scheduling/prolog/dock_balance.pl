
% Entry point
main_rebalance :-
    % 1. Get all vessels and sort them by arrival time
    findall((Arrival, V), vessel(V, Arrival, _, _, _), ListAV),
    sort(ListAV, SortedAV),
    extract_vessels(SortedAV, SortedVessels),

    % 2. Get all docks
    findall(D, dock(D, _, _, _), Docks),

    % 3. Run the assignment logic
    solve_greedy(SortedVessels, Docks, [], FinalAssignments),

    % 4. Calculate final cost
    calc_total_system_delay(FinalAssignments, TotalDelay),

    % 5. Write outputs
    write(FinalAssignments), nl,
    write(TotalDelay), nl.


% 1. Helper to extract just the Vessel ID from the (Arrival, Vessel) list

extract_vessels([], []).
extract_vessels([(_, V)|T], [V|Rest]) :-
    extract_vessels(T, Rest).


% 2. Greedy Allocation: Process one vessel at a time

solve_greedy([], _, Assignments, Assignments).
solve_greedy([V|RestV], Docks, CurrentAssigns, FinalAssigns) :-
    % Find the best dock for vessel V given current assignments
    find_best_dock(V, Docks, CurrentAssigns, BestDock),
    
    % Add new assignment to the list
    append(CurrentAssigns, [assign(V, BestDock)], NewAssigns),
    
    % Recursively process the rest
    solve_greedy(RestV, Docks, NewAssigns, FinalAssigns).


% 3. Find Best Dock
%    Try all docks, calculate the cost (delay) for each, pick the lowest.

find_best_dock(V, Docks, CurrentAssigns, BestDock) :-
    % Create a list of (Cost, Dock) tuples
    get_dock_costs(Docks, V, CurrentAssigns, CostList),
    % Sort by Cost (smallest first)
    sort(CostList, SortedCosts),
    % Pick the Dock from the first item
    extract_best_dock(SortedCosts, BestDock).

% Extract the dock from the first element of the sorted list
extract_best_dock([( _, BestDock)|_], BestDock).

% Helper: Iterate all docks and compute cost for each
get_dock_costs([], _, _, []).
get_dock_costs([D|RestD], V, CurrentAssigns, [(Cost, D)|RestCosts]) :-
    % Calculate what the delay would be if we assigned V to D
    predict_delay(D, V, CurrentAssigns, Cost),
    get_dock_costs(RestD, V, CurrentAssigns, RestCosts).


% 4. Predict Delay
%    Calculates the delay for a specific dock if we add vessel V to it.

predict_delay(Dock, NewVessel, CurrentAssigns, Delay) :-
    % 1. Get vessels already assigned to this dock
    get_vessels_for_dock(CurrentAssigns, Dock, DockVessels),
    
    % 2. Add the new vessel
    append(DockVessels, [NewVessel], AllVessels),
    
    % 3. Sort them by arrival so we calculate time sequentially
    sort_vessels_by_arrival(AllVessels, SortedVessels),
    
    % 4. Calculate the delay for this sequence
    calculate_sequence_delay(SortedVessels, 0, Delay).

% Filter assignments to find those matching the Dock
get_vessels_for_dock([], _, []).
get_vessels_for_dock([assign(V, D)|T], D, [V|Rest]) :- 
    !, % Cut: we found a match, dont backtrack
    get_vessels_for_dock(T, D, Rest).
get_vessels_for_dock([_|T], D, Rest) :-
    get_vessels_for_dock(T, D, Rest).

% Sort helper: get (Arrival, V), sort, extract V
sort_vessels_by_arrival(Vessels, Sorted) :-
    findall((A, V), (member(V, Vessels), vessel(V, A, _, _, _)), Pairs),
    sort(Pairs, SortedPairs),
    extract_vessels(SortedPairs, Sorted).


% 5. Delay Calculation (Simplified Multi-Crane Logic)
%    Assume Max Cranes = 2.


% Base case: No vessels, no delay.
calculate_sequence_delay([], _, 0).

% Recursive case:
% LastEndTime: The time the PREVIOUS vessel finished occupying the dock.
calculate_sequence_delay([V|Rest], LastEndTime, TotalDelay) :-
    vessel(V, Arrival, Departure, Load, Unload),
    
    % Calculate pure processing time (Load + Unload)
    ProcTime is Load + Unload,
    
    % Determine start time: max(Arrival, LastEndTime)
    determine_start(Arrival, LastEndTime, StartTime),
    
    % Calculate Duration using 2 cranes logic (faster)
    % Logic: With 2 cranes, time is roughly halved. 
    % We use integer division: (ProcTime + 1) // 2.
    Duration is (ProcTime + 1) // 2,
    
    EndTime is StartTime + Duration,
    
    % Calculate Delay for this vessel (ActualExit - DesiredDeparture)
    % If ActualExit <= Departure, Delay is 0.
    calc_single_delay(EndTime, Departure, DelayV),
    
    % Recurse for the rest
    calculate_sequence_delay(Rest, EndTime, DelayRest),
    
    % Sum it up
    TotalDelay is DelayV + DelayRest.

% Helper: Max(Arrival, LastEndTime)
determine_start(Arrival, LastEndTime, Arrival) :- 
    Arrival > LastEndTime, !.
determine_start(_, LastEndTime, LastEndTime).

% Helper: Max(0, EndTime - Departure)
calc_single_delay(EndTime, Departure, Diff) :-
    EndTime > Departure, 
    !, 
    Diff is EndTime - Departure.
calc_single_delay(_, _, 0).



% 6. Final Total System Delay
%    Sum up delays of all assignments made.

calc_total_system_delay(Assignments, Total) :-
    findall(D, dock(D, _, _, _), Docks),
    sum_docks(Docks, Assignments, Total).

sum_docks([], _, 0).
sum_docks([D|RestD], Assignments, Total) :-
    get_vessels_for_dock(Assignments, D, VList),
    sort_vessels_by_arrival(VList, Sorted),
    calculate_sequence_delay(Sorted, 0, DelayD),
    sum_docks(RestD, Assignments, RestTotal),
    Total is DelayD + RestTotal.


:- dynamic generations/1.
:- dynamic population/1.
:- dynamic prob_crossover/1.
:- dynamic prob_mutation/1.
:- dynamic elitism_portion/1.
:- dynamic target_cost/1.
:- dynamic stability_generations/1.

generations(60).
population(40).
prob_crossover(0.7).
prob_mutation(0.1).
elitism_portion(0.2).             % fraction of population kept as elites
target_cost(0).                  % 0 means search until other conditions
stability_generations(6).        % stop if population unchanged for this many gens


%  get all vessel ids in a list
vessel_ids(L) :-
    findall(V, vessel(V, _, _, _, _), L).

% number of vessels
num_vessels(N) :- vessel_ids(L), length(L, N).

% generate initial population (no duplicates)
generate_population(Pop) :-
    population(PS),
    vessel_ids(Ids),
    num_vessels(N),
    generate_population(PS, Ids, N, Pop).

generate_population(0, _, _, []) :- !.
generate_population(PS, IdsList, NT, [Ind | Rest]) :-
    PS1 is PS - 1,
    generate_population(PS1, IdsList, NT, Rest),
    generate_individual(IdsList, NT, Ind),
    \+ member(Ind, Rest).  % avoid exact duplicates

generate_individual([G], 1, [G]) :- !.
generate_individual(IdsList, NumT, [G | Rest]) :-
    NumTemp is NumT + 1,
    random(1, NumTemp, N),
    remove_nth(N, IdsList, G, NewList),
    NumT1 is NumT - 1,
    generate_individual(NewList, NumT1, Rest).

remove_nth(1, [G | Rest], G, Rest) :- !.
remove_nth(N, [X | XS], G, [X | R]) :-
    N1 is N - 1,
    remove_nth(N1, XS, G, R).

% evaluate population: produce list Ind * Value where Value = sum_delays for sequence
evaluate_population([], []).
evaluate_population([Ind | R], [Ind*V | R1]) :-
    evaluate_sequence(Ind, V),
    evaluate_population(R, R1).

% evaluate an individual = compute sequence temporization and sum_delays
evaluate_sequence(Ind, TotalDelay) :-
    % Ind is list of vessel atoms in order
    % Use your existing sequence_temporization predicate to compute times
    sequence_temporization(Ind, SeqTriplets),
    sum_delays(SeqTriplets, TotalDelay).

% ordering (ascending by value)
order_population(PopValue, PopValueOrd) :- bsort(PopValue, PopValueOrd).
bsort([X], [X]) :- !.
bsort([X | Xs], Ys) :-
    bsort(Xs, Zs),
    bchange([X | Zs], Ys).

bchange([X], [X]) :- !.
bchange([X*VX, Y*VY | L1], [Y*VY | L2]) :-
    VX > VY, !,
    bchange([X*VX | L1], L2).
bchange([X | L1], [X | L2]) :- bchange(L1, L2).

% --- improved GA main entry point ---
run_genetic :-
    % Ensure params exist or use defaults
    (population(_); (population(40), assertz(population(40)))),
    (generations(_); (generations(60), assertz(generations(60)))),
    (prob_crossover(_); (prob_crossover(0.7), assertz(prob_crossover(0.7)))),   
    (prob_mutation(_); (prob_mutation(0.1), assertz(prob_mutation(0.1)))),
    (elitism_portion(_); (elitism_portion(0.2), assertz(elitism_portion(0.2)))),
    (stability_generations(_); (stability_generations(6), assertz(stability_generations(6)))),
    % 1) create initial population
    population(PS), generate_population(Pop0),
    evaluate_population(Pop0, PopVal0),
    order_population(PopVal0, PopValOrd0),
    generations(NG),
    % 2) run GA loop with stability and target stop conditions
    ga_loop(0, NG, PopValOrd0, BestFinal),

    % 3) BestFinal is BestInd*BestVal
    BestFinal = BestInd*BestVal,
    % BestInd is list of vessel ids
    sequence_temporization(BestInd, SeqTriplets),
    sum_delays(SeqTriplets, FinalDelay),
    write(SeqTriplets), nl,
    write(FinalDelay), nl.

% GA loop: iteration, maxgens, population ordered, returns best element of final population
ga_loop(NG, NG, [Best | _], Best).

ga_loop(I, NG, Pop, Best) :-
    I < NG,
    ga_step(Pop, _PopNext, stable),
    Pop = [Best | _].

ga_loop(I, NG, Pop, Best) :-
    I < NG,
    ga_step(Pop, PopNext, changed),
    I1 is I + 1,
    ga_loop(I1, NG, PopNext, Best).


% This clause applies when the best individual does NOT change
ga_step(PopOrd, PopNextOrd, stable) :-
    % Extract only the individuals
    extract_inds(PopOrd, Parents),

    % Randomly shuffle parents to avoid fixed crossover pairs
    shuffle(Parents, ParentsPerm),

    % Apply crossover to parent pairs to create offspring
    crossover_population(ParentsPerm, Offspring),

    % Apply mutation to each offspring with given probability
    mutate_population(Offspring, OffspringMut),

    % Evaluate offspring fitness (total delay)
    evaluate_population(OffspringMut, OffVal),

    % Merge parents and offspring into a single population
    append(PopOrd, OffVal, Merged),

    % Remove duplicate individuals, keeping the best fitness
    remove_duplicates_by_ind(Merged, MergedUnique),

    % Sort population by fitness (ascending delay)
    order_population(MergedUnique, MergedSorted),

    % Compute number of elite individuals to preserve
    population(PS),
    elitism_portion(EP),
    PEliteFloat is EP * PS,
    PElite is max(1, floor(PEliteFloat)),

    % Keep the elite individuals unchanged
    take_first(MergedSorted, PElite, Elites, RestForLottery),

    % Assign random keys to the remaining individuals
    attach_random_key(RestForLottery, RestRand),

    % Sort remaining individuals using the random keys
    order_population(RestRand, RestRandOrd),

    % Select the remaining individuals to complete population
    RemainingNeeded is PS - PElite,
    take_first(RestRandOrd, RemainingNeeded, RestSelected, _),

    % Combine elites and selected individuals
    append(Elites, RestSelected, NextPopVal),

    % Order final population for next generation
    order_population(NextPopVal, PopNextOrd),

    % Check that the best individual remained the same
    same_best(PopOrd, PopNextOrd).



% This clause applies when the best individual changes
ga_step(PopOrd, PopNextOrd, changed) :-
    % Extract individuals from current population
    extract_inds(PopOrd, Parents),

    % Shuffle parents for random pairing
    shuffle(Parents, ParentsPerm),

    % Generate offspring using crossover
    crossover_population(ParentsPerm, Offspring),

    % Apply mutation to offspring
    mutate_population(Offspring, OffspringMut),

    % Evaluate offspring fitness
    evaluate_population(OffspringMut, OffVal),

    % Merge current population with offspring
    append(PopOrd, OffVal, Merged),

    % Remove duplicate individuals
    remove_duplicates_by_ind(Merged, MergedUnique),

    % Sort population by fitness
    order_population(MergedUnique, MergedSorted),

    % Compute number of elites to preserve
    population(PS),
    elitism_portion(EP),
    PEliteFloat is EP * PS,
    PElite is max(1, floor(PEliteFloat)),

    % Select elite individuals
    take_first(MergedSorted, PElite, Elites, RestForLottery),

    % Assign random selection keys to remaining individuals
    attach_random_key(RestForLottery, RestRand),

    % Sort remaining individuals by random keys
    order_population(RestRand, RestRandOrd),

    % Select remaining individuals to complete population
    RemainingNeeded is PS - PElite,
    take_first(RestRandOrd, RemainingNeeded, RestSelected, _),

    % Build next population
    append(Elites, RestSelected, NextPopVal),

    % Sort next population
    order_population(NextPopVal, PopNextOrd),

    % Check that the best individual is different
    \+ same_best(PopOrd, PopNextOrd).



% Succeeds when the best individual and its fitness are equal
same_best([Ind*Val | _], [Ind*Val | _]).


extract_inds([], []).
extract_inds([Ind*_|R], [Ind|R1]) :- extract_inds(R, R1).

% crossover_population: pair successive elements after permutation
crossover_population([], []).
crossover_population([A], [A]).   % odd last remains as is
crossover_population([I1, I2 | Rest], [C1, C2 | RestC]) :-
    prob_crossover(Pc), random(0.0, 1.0, R),
    (R =< Pc -> cross(I1, I2, C1, C2) ; C1 = I1, C2 = I2),
    crossover_population(Rest, RestC).

% mutate_population: try mutate each individual
mutate_population([], []).
mutate_population([I|R], [MI|RR]) :-
    prob_mutation(Pm), random(0.0, 1.0, Rm),
    (Rm < Pm -> mutacao1(I, MI) ; MI = I),
    mutate_population(R, RR).

fillh([ ],[ ]).
fillh([_|R1],[h|R2]):-
fillh(R1,R2).

sublist(L1,I1,I2,L):-I1 < I2,!, sublist1(L1,I1,I2,L).
sublist(L1,I1,I2,L):-sublist1(L1,I2,I1,L).

sublist1([X|R1],1,1,[X|H]):-!, fillh(R1,H).
sublist1([X|R1],1,N2,[X|R2]):-!,N3 is N2 - 1, sublist1(R1,1,N3,R2).
sublist1([_|R1],N1,N2,[h|R2]):-N3 is N1 - 1,
    N4 is N2 - 1,
    sublist1(R1,N3,N4,R2).

rotate_right(L,K,L1):- num_vessels(N),
    T is N - K,
    rr(T,L,L1).

rr(0,L,L):-!.
rr(N,[X|R],R2):- N1 is N - 1,
    append(R,[X],R1),
    rr(N1,R1,R2).

remove([],_,[]):-!.
remove([X|R1],L,[X|R2]):- not(member(X,L)),!, remove(R1,L,R2).
remove([_|R1],L,R2):- remove(R1,L,R2).

insert([],L,_,L):-!.
insert([X|R],L,N,L2):-
    num_vessels(T),
    ((N>T,!,N1 is N mod T);N1 = N),
    insert1(X,N1,L,L1),
    N2 is N + 1,
    insert(R,L1,N2,L2).

insert1(X,1,L,[X|L]):-!.
insert1(X,N,[Y|L],[Y|L1]):- N1 is N-1, insert1(X,N1,L,L1).

cross(Ind1,Ind2,P1,P2,NInd11):-
    sublist(Ind1,P1,P2,Sub1),
    num_vessels(NumT),
    R is NumT-P2,
    rotate_right(Ind2,R,Ind21),
    remove(Ind21,Sub1,Sub2),
    P3 is P2 + 1,
    insert(Sub2,Sub1,P3,NInd1),
    removeh(NInd1,NInd11).

removeh([],[]).
removeh([h|R1],R2):-!, removeh(R1,R2).
removeh([X|R1],[X|R2]):- removeh(R1,R2).

mutacao1(Ind,NInd):-
    generate_crossover_points(P1,P2),
    mutacao22(Ind,P1,P2,NInd).

mutacao22([G1|Ind],1,P2,[G2|NInd]):-
    !, P21 is P2-1,
    mutacao23(G1,P21,Ind,G2,NInd).

mutacao22([G|Ind],P1,P2,[G|NInd]):-
    P11 is P1-1, P21 is P2-1,
    mutacao22(Ind,P11,P21,NInd).

mutacao23(G1,1,[G2|Ind],G2,[G1|Ind]):-!.
mutacao23(G1,P,[G|Ind],G2,[G|NInd]):-
    P1 is P-1,
    mutacao23(G1,P1,Ind,G2,NInd).

% remove duplicates
remove_duplicates_by_ind(List, Unique) :-
    remove_duplicates_by_ind(List, [], Unique).

remove_duplicates_by_ind([], Acc, Acc).

remove_duplicates_by_ind([Ind*Val | Rest], Acc, Out) :-
    member_ind(Ind, Acc),
    get_value(Ind, Acc, OldVal),
    Val < OldVal,
    remove_ind(Ind, Acc, Acc1),
    Acc2 = [Ind*Val | Acc1],
    remove_duplicates_by_ind(Rest, Acc2, Out).

remove_duplicates_by_ind([Ind*Val | Rest], Acc, Out) :-
    member_ind(Ind, Acc),
    get_value(Ind, Acc, OldVal),
    Val >= OldVal,
    remove_duplicates_by_ind(Rest, Acc, Out).

remove_duplicates_by_ind([Ind*Val | Rest], Acc, Out) :-
    \+ member_ind(Ind, Acc),
    Acc1 = [Ind*Val | Acc],
    remove_duplicates_by_ind(Rest, Acc1, Out).

member_ind(Ind, [Ind*_ | _]).
member_ind(Ind, [_ | R]) :-
    member_ind(Ind, R).

remove_ind(_, [], []).
remove_ind(Ind, [Ind*_ | R], R).
remove_ind(Ind, [X | R], [X | R1]) :-
    remove_ind(Ind, R, R1).

get_value(Ind, [Ind*Val | _], Val).
get_value(Ind, [_ | R], Val) :-
    get_value(Ind, R, Val).

replace_ind(Ind, NewVal, [Ind*_ | R], [Ind*NewVal | R]).
replace_ind(Ind, NewVal, [X | R], [X | R1]) :-
    replace_ind(Ind, NewVal, R, R1).

% take_first(N, List, FirstN, Rest)
take_first(0, L, [], L) :- !.
take_first(_, [], [], []) :- !.
take_first(N, [X | XS], [X | Ys], Rest) :-
    N1 is N - 1, take_first(N1, XS, Ys, Rest).

% attach_random_key: multiply Val by rnd(0,1) but keep Ind*Val format (value remains Val)
attach_random_key([], []).
attach_random_key([Ind*Val | Rest], [Ind*NewVal | Rest2]) :-
    random(0.0, 1.0, R),
    NewVal is Val * R,
    attach_random_key(Rest, Rest2).

shuffle([], []).
shuffle(L, [X | R]) :-
    length(L, N),
    random(1, N+1, K),
    remove_nth(K, L, X, Rest),
    shuffle(Rest, R).


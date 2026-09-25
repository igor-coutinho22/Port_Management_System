

:- dynamic generations/1.
:- dynamic population/1.
:- dynamic prob_crossover/1.
:- dynamic prob_mutation/1.
:- dynamic elitism_portion/1.
:- dynamic target_cost/1.
:- dynamic stability_generations/1.

generations(150).
population(40).
prob_crossover(0.7).
prob_mutation(0.1).
elitism_portion(0.2).             % fraction of population kept as elites
target_cost(0).                  % 0 means search until other conditions
stability_generations(25).       % stop if the best has not improved for this many gens


%  get all vessel ids in a list
vessel_ids(L) :-
    findall(V, vessel(V, _, _, _, _), L).

% number of vessels
num_vessels(N) :- vessel_ids(L), length(L, N).

% generate initial population (no duplicates)
% There are only N! distinct sequences, so the population is capped at N! (e.g. 24 for 4 vessels).
generate_population(Pop) :-
    population(PS0),
    vessel_ids(Ids),
    num_vessels(N),
    factorial(N, MaxDistinct),
    PS is min(PS0, MaxDistinct),
    generate_population(PS, Ids, N, [], Pop).

% A duplicate individual is simply drawn again (instead of failing the whole generation)
generate_population(0, _, _, Pop, Pop) :- !.
generate_population(PS, IdsList, NT, Acc, Pop) :-
    generate_individual(IdsList, NT, Ind),
    (   memberchk(Ind, Acc)
    ->  generate_population(PS, IdsList, NT, Acc, Pop)
    ;   PS1 is PS - 1,
        generate_population(PS1, IdsList, NT, [Ind | Acc], Pop)
    ).

factorial(N, 1) :- N =< 1, !.
factorial(N, F) :- N1 is N - 1, factorial(N1, F1), F is N * F1.

generate_individual([], 0, []) :- !.
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

% ordering (ascending by value); keysort is stable and deterministic
order_population(PopValue, PopValueOrd) :-
    findall(V-(Ind*V), member(Ind*V, PopValue), Keyed),
    keysort(Keyed, Sorted),
    pairs_values(Sorted, PopValueOrd).

% --- GA main entry point ---
run_genetic :-
    % Ensure params exist or use defaults
    % (if-then-else: no choice points, so a later failure cannot re-run these and assert duplicates)
    (population(_) -> true ; assertz(population(40))),
    (generations(_) -> true ; assertz(generations(150))),
    (prob_crossover(_) -> true ; assertz(prob_crossover(0.7))),
    (prob_mutation(_) -> true ; assertz(prob_mutation(0.1))),
    (elitism_portion(_) -> true ; assertz(elitism_portion(0.2))),
    (stability_generations(_) -> true ; assertz(stability_generations(25))),
    % create initial population: heuristic solutions + random sequences
    generate_population(RandomPop),
    length(RandomPop, PS),
    heuristic_seeds(Seeds),
    append(Seeds, RandomPop, Candidates),
    list_to_set(Candidates, UniqueCandidates),
    take_first(PS, UniqueCandidates, Pop0, _),
    evaluate_population(Pop0, PopVal0),
    order_population(PopVal0, PopValOrd0),
    generations(NG),
    stability_generations(SG),
    % run the GA until the generation limit or until the best stops improving
    ga_loop(0, NG, SG, 0, PopValOrd0, BestInd*_BestVal),
    % BestInd is list of vessel ids
    sequence_temporization(BestInd, SeqTriplets),
    sum_delays(SeqTriplets, FinalDelay),
    write(SeqTriplets), nl,
    write(FinalDelay), nl.

% heuristic_seeds(-Seeds): vessel orders produced by the constructive heuristics.
% Starting from them (plus random sequences) the GA, thanks to elitism, is never worse
% than the best heuristic and searches for improvements around it.
heuristic_seeds(Seeds) :-
    findall(Seq,
            ( member(H, [atc, early_departure_time, minimum_slack_time, arrived_shortest_departure_time]),
              catch(call_heuristic(H, Triplets, _), _, fail),
              findall(V, member((V, _, _), Triplets), Seq),
              Seq \== [] ),
            Seeds0),
    list_to_set(Seeds0, Seeds).

% ga_loop(+Gen, +MaxGens, +MaxStableGens, +StableGens, +PopOrdered, -Best)
% Stops after MaxGens generations, or after MaxStableGens consecutive generations
% without improving the best total delay. Returns the best individual found.
ga_loop(Gen, MaxGens, _, _, [Best | _], Best) :-
    Gen >= MaxGens, !.
ga_loop(_, _, MaxStable, Stable, [Best | _], Best) :-
    Stable >= MaxStable, !.
ga_loop(Gen, MaxGens, MaxStable, Stable, Pop, Best) :-
    ga_step(Pop, PopNext),
    Pop = [_*BestVal | _],
    PopNext = [_*NextBestVal | _],
    (   NextBestVal < BestVal
    ->  Stable1 = 0
    ;   Stable1 is Stable + 1
    ),
    Gen1 is Gen + 1,
    ga_loop(Gen1, MaxGens, MaxStable, Stable1, PopNext, Best).

% ga_step(+PopOrdered, -NextPopOrdered): one generation
% crossover + mutation, then elitism (best individuals always survive, so the best
% never gets worse) and a fitness-biased lottery for the remaining places.
ga_step(PopOrd, PopNextOrd) :-
    extract_inds(PopOrd, Parents),
    shuffle(Parents, ParentsPerm),                  % random pairing of parents
    crossover_population(ParentsPerm, Offspring),
    mutate_population(Offspring, OffspringMut),
    evaluate_population(OffspringMut, OffVal),
    append(PopOrd, OffVal, Merged),
    remove_duplicates_by_ind(Merged, MergedUnique),
    order_population(MergedUnique, MergedSorted),
    population(PS0),
    length(MergedSorted, Available),
    PS is min(PS0, Available),
    elitism_portion(EP),
    PElite is max(1, floor(EP * PS)),
    take_first(PElite, MergedSorted, Elites, Others),
    Remaining is PS - PElite,
    lottery_select(Others, Remaining, Selected),
    append(Elites, Selected, NextPopVal),
    order_population(NextPopVal, PopNextOrd), !.

% lottery_select(+Candidates, +N, -Selected): picks N individuals, favouring low delays.
% The random key (delay * rnd) is only used for choosing; the real delays are kept.
lottery_select(Candidates, N, Selected) :-
    findall(Key-(Ind*Val),
            ( member(Ind*Val, Candidates),
              random(0.0, 1.0, R),
              Key is Val * R ),
            Keyed),
    keysort(Keyed, Sorted),
    pairs_values(Sorted, Ordered),
    take_first(N, Ordered, Selected, _).

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

% generate_crossover_points(-P1, -P2): two distinct positions with P1 < P2
% (with fewer than 2 vessels there is nothing to cross or mutate)
generate_crossover_points(1, 1) :-
    num_vessels(N), N < 2, !.
generate_crossover_points(P1, P2) :-
    num_vessels(N),
    N1 is N + 1,
    repeat,
    random(1, N1, A),
    random(1, N1, B),
    A =\= B, !,
    P1 is min(A, B),
    P2 is max(A, B).

% cross/4: order crossover between two parents at random cut points, producing two children
cross(Ind, _, Ind, Ind) :-
    num_vessels(N), N < 2, !.
cross(Ind1, Ind2, Child1, Child2) :-
    generate_crossover_points(P1, P2),
    cross(Ind1, Ind2, P1, P2, Child1),
    cross(Ind2, Ind1, P1, P2, Child2).

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

mutacao1(Ind,Ind):-
    num_vessels(N), N < 2, !.
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

% remove duplicates: one copy of each sequence (the fitness of a sequence is deterministic)
remove_duplicates_by_ind(List, Unique) :-
    findall(Ind-Val, member(Ind*Val, List), Pairs),
    sort(1, @<, Pairs, UniquePairs),
    findall(Ind*Val, member(Ind-Val, UniquePairs), Unique).

% take_first(N, List, FirstN, Rest)
take_first(0, L, [], L) :- !.
take_first(_, [], [], []) :- !.
take_first(N, [X | XS], [X | Ys], Rest) :-
    N1 is N - 1, take_first(N1, XS, Ys, Rest).

shuffle([], []) :- !.
shuffle(L, [X | R]) :-
    length(L, N),
    N1 is N + 1,
    random(1, N1, K),
    remove_nth(K, L, X, Rest),
    shuffle(Rest, R).


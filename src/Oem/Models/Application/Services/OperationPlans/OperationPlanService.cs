using Oem.Models.Domain.OperationPlans;
using Oem.Models.Domain.OperationPlans.Service;

namespace Oem.Models.Application.Services
{
    public class OperationPlanService : IOperationPlanService
    {
        private readonly IOperationPlanRepository _repository;
        
        public OperationPlanService(
            IOperationPlanRepository repository)
        {
            _repository = repository;
        }

        public async Task<OperationPlan?> GetPlanByDateAsync(DateOnly date)
        {
            return await _repository.GetByDateAsync(date);
        }

        public async Task<OperationPlan?> GetPlanByIdAsync(Guid Id)
        {
            return await _repository.GetByIdAsync(Id);
        }

        public async Task SavePlanAsync(OperationPlan plan)
        {
            if (plan == null)
            {
                throw new ArgumentNullException(nameof(plan));
            }

            var existingPlan = await _repository.GetByIdAsync(plan.Id);
            if (existingPlan != null)
            {
                throw new ArgumentException($"An operation plan with ID: {plan.Id} already exists.");
            }

            await _repository.AddAsync(plan);
        }

        public async Task DeletePlanAsync(Guid Id)
        {
            var plan = await _repository.GetByIdAsync(Id);
            if (plan == null)
            {
                throw new ArgumentException($"Operation Plan with ID: {Id} does not exist.");
            }

            await _repository.DeleteAsync(plan);
        }
    }

    /* Na aba do scheduling, escolhe se o dia e o algoritmo como já está e corre se. Com o body e informações pela pagina ja temos tudo: autor pelo user logado,
        target day e algoritmo pq o user ja os escolheu e depois o runtime, crane e delay vem no report ou objeto retornado. Os times tambem sao calculados a
        partir do report ou objeto retornado. Ideia é após gerar os resultados como tem agora a gerar (oq ja esta implementado), aparecer um botao para abrir em
        JSON ou em tabela o OperationPlan formado e depois dar a opção ao user para aceitar ou recusar */
}
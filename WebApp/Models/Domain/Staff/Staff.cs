using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Staff.Enums;
using Domain.Staff.Entities;

namespace Domain.Staff.Entities
{
    public class Staff : BaseEntity
    {
        public string MecanographicNumber { get; private set; }
        public string ShortName { get; private set; }
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public StaffStatus Status { get; private set; }

        public Schedule OperationalWindow { get; private set; }

        private readonly List<Qualification> _qualifications = new();
        public IReadOnlyCollection<Qualification> Qualifications => _qualifications.AsReadOnly();

        // Required by EF
        private Staff() { }

        public Staff(string mecanographicNumber, string shortName, string email, string phone, Schedule operationalWindow)
        {
            Id = Guid.NewGuid();
            MecanographicNumber = mecanographicNumber;
            ShortName = shortName;
            Email = email;
            Phone = phone;
            Status = StaffStatus.Available;
            OperationalWindow = operationalWindow;
        }

        public void AddQualification(Qualification qualification)
        {
            if (!_qualifications.Contains(qualification))
                _qualifications.Add(qualification);
        }

        public void ChangeStatus(StaffStatus newStatus)
        {
            Status = newStatus;
        }

        public void Deactivate()
        {
            Status = StaffStatus.Inactive;
        }

        public void Reactivate()
        {
            Status = StaffStatus.Available;
        }
    }
}

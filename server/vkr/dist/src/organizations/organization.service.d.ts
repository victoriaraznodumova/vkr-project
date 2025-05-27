import { Repository } from 'typeorm';
import { Organization } from './entity/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationService {
    private readonly organizationRepository;
    constructor(organizationRepository: Repository<Organization>);
    create(createOrganizationDto: CreateOrganizationDto): Promise<Organization>;
    findAll(): Promise<Organization[]>;
    findOne(id: number): Promise<Organization>;
    update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization>;
    remove(id: number): Promise<void>;
}

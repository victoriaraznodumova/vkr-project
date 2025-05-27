import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationDto } from './dto/organization.dto';
export declare class OrganizationController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationService);
    create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationDto>;
    findAll(): Promise<OrganizationDto[]>;
    findOne(id: number): Promise<OrganizationDto>;
    update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationDto>;
    remove(id: number): Promise<void>;
}

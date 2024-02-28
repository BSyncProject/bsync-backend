import { Collector, CollectorModel } from '../models/Collector'; // Assuming Collector model is defined

class CollectorRepository {
  
  async create(collectorData: Partial<Collector>): Promise<Collector> {
    const newCollector = await CollectorModel.create(collectorData);
    return newCollector;
  }

  async findOne(username: string){
    const foundCollector =  CollectorModel.findOne({username: username});
    return foundCollector;
  }

  async check(username: string, email: string){

    const collector = await this.findOne(username);
    if(collector){
      return collector;
    } else {
      return CollectorModel.findOne({email: email});
    }

  }

  async getAll(): Promise<Collector[]> {
    const allCollectors = await CollectorModel.find().populate('picker').exec();
    return allCollectors;
  }

  async getById(id: string): Promise<Collector | null> {
    const collector = await CollectorModel.findById(id).populate('picker').exec();
    return collector;
  }

  async update(id: string, collectorData: Partial<Collector>): Promise<Collector | null> {
    const updatedCollector = await CollectorModel.findByIdAndUpdate(id, collectorData, { new: true }).exec();
    return updatedCollector;
  }

  async delete(id: string): Promise<void> {
    await CollectorModel.findByIdAndDelete(id).exec();
  }
}

export default CollectorRepository;

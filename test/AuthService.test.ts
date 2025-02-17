import { api } from '../api/api';
import { AuthService } from '../services/auth';


jest.mock('../api/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data if secretKey is valid', async () => {
      const mockUser = { id: 1, name: 'John Doe', secretKey: 'validKey' };
     
      (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue({ data: [mockUser] });

      const result = await AuthService.login('validKey');

      expect(api.get).toHaveBeenCalledWith('/warehousemans?secretKey=validKey');
      expect(result).toEqual(mockUser);
    });

    it('should return null if secretKey is invalid', async () => {
      (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue({ data: [] });

      const result = await AuthService.login('invalidKey');

      expect(api.get).toHaveBeenCalledWith('/warehousemans?secretKey=invalidKey');
      expect(result).toBeNull();
    });

    it('should throw an error if API call fails', async () => {
      const mockError = new Error('API Error');
      (api.get as jest.MockedFunction<typeof api.get>).mockRejectedValue(mockError);

      await expect(AuthService.login('validKey')).rejects.toThrow('API Error');
    });
  });

  describe('getWarehousemanById', () => {
    it('should return warehouseman data if userId is valid', async () => {
      const mockWarehouseman = { id: 1, name: 'John Doe' };
      (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue({ data: mockWarehouseman });

      const result = await AuthService.getWarehousemanById(1);

      expect(api.get).toHaveBeenCalledWith('/warehousemans/1');
      expect(result).toEqual(mockWarehouseman);
    });

    it('should throw an error if API call fails', async () => {
      const mockError = new Error('API Error');
      (api.get as jest.MockedFunction<typeof api.get>).mockRejectedValue(mockError);

      await expect(AuthService.getWarehousemanById(1)).rejects.toThrow('API Error');
    });
  });
});
